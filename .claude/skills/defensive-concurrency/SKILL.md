---
name: defensive-concurrency
description: Defensive Concurrency & Daemon Protocol — Invariant-based race condition prevention, atomic I/O, and lifecycle resilience
stratum: Architecture & Quality
tags: [concurrency, daemons, locks, atomic-io, race-conditions, resilience]
---

# Defensive Concurrency & Daemon Protocol

## 1. Core Doctrine
**Shared state without atomic barriers is guaranteed corruption.**
In distributed and multi-process systems, race conditions, stale locks, and partial reads will occur unless every concurrent boundary is guarded by strict, deterministic primitives.

## 2. The 5 Invariants of Concurrency Resilience

```
  ┌────────────────────────────────────────────────────────┐
  │ 1. ATOMIC I/O (Write-Temp-Rename)                      │
  │    Write to *.tmp -> Flush -> Fsync -> Atomic Replace  │
  └──────────────────────────┬────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. NON-BLOCKING LOCKS & STALE PID RECOVERY             │
  │    Check OS process table before respecting lockfile   │
  └──────────────────────────┬────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. SINGLE-CONSUMER POLLING ISOLATION                   │
  │    Guarantee 1 polling process per token; yield on 409 │
  └──────────────────────────┬────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 4. BOUNDED SLIDING-WINDOW DEDUPLICATION                │
  │    Ring buffer / TTL cache to prevent memory explosion │
  └──────────────────────────┬────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 5. DETERMINISTIC SHUTDOWN & CLEANUP                    │
  │    Register atexit and signal handlers (SIGTERM/INT)   │
  └────────────────────────────────────────────────────────┘
```

## 3. Mandatory Implementation Patterns

### 1. Atomic File Operations
Never write directly to a shared state file. Always write to a temporary sibling file and atomically rename:
```python
import os, tempfile

def atomic_write(filepath: str, content: str) -> None:
    dirname = os.path.dirname(filepath)
    with tempfile.NamedTemporaryFile("w", dir=dirname, delete=False, encoding="utf-8") as tf:
        tf.write(content)
        tf.flush()
        os.fsync(tf.fileno())
        temp_name = tf.name
    os.replace(temp_name, filepath)
```

### 2. Lock Acquisition with Stale PID Pruning
A lockfile containing a PID must verify if that PID is actually alive via the OS kernel before rejecting new instances:
- On POSIX: `os.kill(pid, 0)`
- On Windows: `OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, ...)` or checking process table via `psutil`/`ctypes`.
- If the PID is dead, the lock is stale: delete it and claim ownership.

### 3. Sliding-Window Deduplication
To prevent processing duplicate events while bounding RAM usage:
- Maintain a fixed-size `collections.deque(maxlen=1000)` of recent event hashes / message IDs.
- For high-throughput systems, use a TTL-based sliding set with periodic cleanup.

### 4. Backoff with Jitter
When encountering resource contention (`HTTP 409 Conflict`, database locked `SQLITE_BUSY`):
- Do not poll in a tight loop.
- Apply exponential backoff with full jitter: `t = min(max_interval, base * 2**attempt) + uniform(0, jitter)`.
- Log the backoff state clearly with timestamps.

### 5. Signal Interception & Cleanup
Every daemon must register handlers for termination signals:
- POSIX: `SIGTERM`, `SIGINT`
- Windows: `SetConsoleCtrlHandler` / `signal.SIGINT` / `atexit.register`
- On signal: Stop accepting new ingress, flush pending egress buffers, remove PID/lockfiles, and exit cleanly with code 0.
