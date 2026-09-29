---
name: idempotent-execution
description: Idempotent Execution & Deduplication Protocol — State-locking finite state machine, payload hashing, and at-most-once execution guarantees
stratum: Architecture & Distributed Systems
tags: [idempotency, deduplication, distributed-systems, transactions, consistency, fault-tolerance]
---

# Idempotent Execution & Deduplication Protocol

## 1. Core Doctrine
**An un-idempotent operation repeated under network failure is indistinguishable from a user error.**
In distributed networks, background daemons, and autonomous agent loops, transient network timeouts (`ETIMEDOUT`, HTTP 504) or crash restarts inherently trigger automated retries. Without strict idempotency guards, retried requests cause catastrophic state divergence: duplicate ledger mutations, duplicated external API calls, re-sent messages, and corrupt split-brain files.

Every mutation boundary across Faust's subsystems must enforce **at-most-once execution semantics**.

## 2. The 3-Phase Execution State Machine

```
         Incoming Mutation Directive / Request
                          │
                          ▼
             Extract / Compute Idempotency Key
       (Header: X-Idempotency-Key or SHA-256 Digest)
                          │
                          ▼
            Query Idempotency Registry / Storage
                          │
          ┌───────────────┼───────────────┐
          │ State:        │ State:        │ State:
          ▼               ▼               ▼
     [IN_FLIGHT]     [COMPLETED]       [NOT_FOUND / EXPIRED]
          │               │               │
     Acquisition     Return Cached   Atomic INSERT [IN_FLIGHT]
     Lock Active     Payload & Code  with Lease Timeout
          │               │               │
     Fail fast            │          Execute Business Logic
     HTTP 409 Conflict    │               │
                          │        ┌──────┴──────┐
                          │        ▼             ▼
                          │    [SUCCESS]     [EXCEPTION]
                          │        │             │
                          │   Update State: Update State:
                          │   [COMPLETED]   [FAILED] (or DELETE)
                          │   Store Result  Release Lock
                          │        │             │
                          └────────┼─────────────┘
                                   ▼
                            Return Response
```

1. **`NOT_FOUND / EXPIRED`**:
   - Atomically acquire the execution lease by inserting an `IN_FLIGHT` record tagged with timestamp, caller identity, and lease timeout.
   - Proceed into the underlying business logic.
2. **`IN_FLIGHT` (Concurrent Race Guard)**:
   - A concurrent worker or retry is already executing this exact operation.
   - Immediately reject with `409 Conflict` (or wait/poll if synchronous deduplication queue is configured). Never execute concurrently.
3. **`COMPLETED` (Short-Circuit Cache Return)**:
   - Operation already succeeded. Return the exact serialized response, status code, and headers without touching backend side-effects.
4. **`FAILED` (Failure Reconciliation)**:
   - If business logic raises a transient error, release or delete the record to allow clean retries. If a permanent invariant violation occurred, record `FAILED` so bad requests cannot consume retry budgets.

## 3. Mandatory Implementation Pattern

### Production-Grade SQLite-Backed Idempotency Engine (Zero Third-Party Dependencies)

```python
import functools
import hashlib
import json
import sqlite3
import time
from pathlib import Path
from typing import Any, Callable, Dict, Optional, Tuple


class IdempotencyConflictError(Exception):
    """Raised when an operation with the same key is currently IN_FLIGHT."""
    pass


class SQLiteIdempotencyStore:
    """Thread-safe, WAL-enabled atomic idempotency lease and response store."""

    def __init__(self, db_path: Path, default_ttl_seconds: int = 86400, lease_timeout_seconds: int = 60):
        self.db_path = db_path
        self.default_ttl = default_ttl_seconds
        self.lease_timeout = lease_timeout_seconds
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path), timeout=5.0)
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.execute("PRAGMA synchronous = NORMAL;")
        return conn

    def _init_db(self) -> None:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        with self._get_connection() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS idempotency_keys (
                    idempotency_key TEXT PRIMARY KEY,
                    payload_hash TEXT NOT NULL,
                    state TEXT NOT NULL CHECK(state IN ('IN_FLIGHT', 'COMPLETED', 'FAILED')),
                    status_code INTEGER,
                    response_json TEXT,
                    created_at REAL NOT NULL,
                    expires_at REAL NOT NULL
                );
                """
            )
            conn.execute("CREATE INDEX IF NOT EXISTS idx_expires_at ON idempotency_keys(expires_at);")

    def acquire_or_get(self, key: str, payload_hash: str) -> Tuple[str, Optional[Dict[str, Any]]]:
        """
        Attempts to acquire an IN_FLIGHT lease.
        Returns:
            Tuple of ('PROCEED', None) -> Caller has acquired lease and must execute.
            Tuple of ('COMPLETED', response_dict) -> Already finished, return response.
            Tuple of ('CONFLICT', None) -> Currently running by another worker.
        """
        now = time.time()
        expires_at = now + self.default_ttl

        with self._get_connection() as conn:
            # 1. Clean up expired keys opportunistically
            conn.execute("DELETE FROM idempotency_keys WHERE expires_at < ?;", (now,))

            # 2. Query existing state
            cursor = conn.execute(
                "SELECT state, payload_hash, response_json, created_at FROM idempotency_keys WHERE idempotency_key = ?;",
                (key,)
            )
            row = cursor.fetchone()

            if row:
                state, existing_hash, response_json, created_at = row

                # Detect key reuse with differing payloads
                if existing_hash != payload_hash:
                    raise ValueError(
                        f"Idempotency key collision with mismatched payload: {key}"
                    )

                if state == "COMPLETED":
                    return "COMPLETED", json.loads(response_json) if response_json else {}

                if state == "IN_FLIGHT":
                    # Check if lease expired (process crash recovery)
                    if (now - created_at) > self.lease_timeout:
                        # Lease expired, overwrite with new IN_FLIGHT
                        conn.execute(
                            "UPDATE idempotency_keys SET state = 'IN_FLIGHT', created_at = ? WHERE idempotency_key = ?;",
                            (now, key)
                        )
                        return "PROCEED", None
                    return "CONFLICT", None

            # 3. Insert new IN_FLIGHT lease atomically
            try:
                conn.execute(
                    """
                    INSERT INTO idempotency_keys 
                    (idempotency_key, payload_hash, state, created_at, expires_at)
                    VALUES (?, ?, 'IN_FLIGHT', ?, ?);
                    """,
                    (key, payload_hash, now, expires_at)
                )
                return "PROCEED", None
            except sqlite3.IntegrityError:
                return "CONFLICT", None

    def complete(self, key: str, response_data: Dict[str, Any], status_code: int = 200) -> None:
        """Marks the execution COMPLETED and persists the exact serialized response."""
        now = time.time()
        with self._get_connection() as conn:
            conn.execute(
                """
                UPDATE idempotency_keys 
                SET state = 'COMPLETED', status_code = ?, response_json = ?, created_at = ?
                WHERE idempotency_key = ?;
                """,
                (status_code, json.dumps(response_data, ensure_ascii=False), now, key)
            )

    def fail(self, key: str, remove: bool = True) -> None:
        """Releases the lease or marks FAILED on unhandled exceptions."""
        with self._get_connection() as conn:
            if remove:
                conn.execute("DELETE FROM idempotency_keys WHERE idempotency_key = ?;", (key,))
            else:
                conn.execute(
                    "UPDATE idempotency_keys SET state = 'FAILED' WHERE idempotency_key = ?;",
                    (key,)
                )


def compute_payload_hash(payload: Any) -> str:
    """Computes a deterministic SHA-256 digest of arbitrary serializable structures."""
    serialized = json.dumps(payload, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def idempotent(store: SQLiteIdempotencyStore, key_extractor: Callable[..., str]):
    """Decorator to enforce strict idempotency on state-mutating functions."""
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            key = key_extractor(*args, **kwargs)
            payload_hash = compute_payload_hash({"args": args, "kwargs": kwargs})

            status, cached_response = store.acquire_or_get(key, payload_hash)

            if status == "COMPLETED":
                return cached_response
            elif status == "CONFLICT":
                raise IdempotencyConflictError(
                    f"Concurrent operation in-flight for idempotency key '{key}'."
                )

            try:
                result = func(*args, **kwargs)
                store.complete(key, result)
                return result
            except Exception:
                store.fail(key, remove=True)
                raise

        return wrapper
    return decorator
```

## 4. Architectural Rules for Faust Subsystems
1. **Zero State Mutation Without Keying**:
   - Any endpoint or C2 directive that updates files, triggers git pushes, or dispatches external notifications must accept or derive an idempotency key (e.g., `update_id`, commit SHA, or request UUID).
2. **Payload Fingerprint Verification**:
   - Never allow the same idempotency key to be reused with a differing request body. If keys match but payload hashes diverge, reject with `422 Unprocessable Entity` or raise `ValueError`.
3. **Bounded Lease Timeouts**:
   - An `IN_FLIGHT` lease must expire automatically (default: 60s) to prevent permanent deadlocks if a worker process crashes mid-execution.
4. **Idempotent Retries in Standby & C2**:
   - When polling Telegram updates, always record the highest `processed_update_id` in transactional SQLite storage before dispatching tasks.
