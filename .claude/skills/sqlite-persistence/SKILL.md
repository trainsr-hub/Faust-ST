---
name: sqlite-persistence
description: SQLite Persistence & Migration Protocol — WAL mode concurrency, atomic ACID transactions, and deterministic schema migrations
stratum: Architecture & Backend
tags: [sqlite, database, acid, migrations, persistence, wal, backend]
---

# SQLite Persistence & Migration Protocol

## 1. Core Doctrine
**An unconfigured SQLite database is a deadlock waiting to happen.**
SQLite is exceptionally robust and fast, but defaults to conservative legacy modes. Every SQLite connection across Faust's subsystems and backend engines must enforce production-grade PRAGMA settings, atomic transaction envelopes, and forward-only schema migrations.

## 2. The 5 Production Invariants

```
  ┌────────────────────────────────────────────────────────┐
  │ 1. PRODUCTION PRAGMAS                                  │
  │    WAL journal mode + NORMAL sync + 5000ms busy timeout│
  └──────────────────────────┬────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. FOREIGN KEY ENFORCEMENT                             │
  │    PRAGMA foreign_keys = ON on EVERY connection        │
  └──────────────────────────┬────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. IMMEDIATE WRITE TRANSACTIONS                        │
  │    BEGIN IMMEDIATE to prevent upgrade deadlocks        │
  └──────────────────────────┬────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 4. STRICT PARAMETERIZED QUERIES                        │
  │    Zero string formatting or f-strings in SQL          │
  └──────────────────────────┬────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 5. IDEMPOTENT MIGRATION LEDGER                         │
  │    _schema_migrations table tracks version & checksums │
  └────────────────────────────────────────────────────────┘
```

## 3. Mandatory Connection Bootstrap

Every SQLite connection must execute this configuration before executing any domain query:

```python
import sqlite3

def get_connection(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(
        db_path,
        timeout=10.0,
        isolation_level=None  # Enable explicit transaction management
    )
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA busy_timeout = 5000;")
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn
```

## 4. Transaction & Concurrency Invariants

1. **Avoid Deferred Deadlocks**:
   - For write operations, always use `BEGIN IMMEDIATE;`.
   - Never start a read transaction that later upgrades to a write transaction on the same connection without `IMMEDIATE`.

2. **Strict Context Management**:
   ```python
   def execute_write(conn: sqlite3.Connection, query: str, params: tuple):
       with conn:
           conn.execute("BEGIN IMMEDIATE;")
           conn.execute(query, params)
   ```

3. **100% Parameterized Statements**:
   - `cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))`
   - **Never** use: `f"SELECT * FROM users WHERE id = '{user_id}'"` (SQL injection vulnerability).

4. **Deterministic Migration Pattern**:
   - Maintain a `_schema_migrations` table:
     ```sql
     CREATE TABLE IF NOT EXISTS _schema_migrations (
         version INTEGER PRIMARY KEY,
         name TEXT NOT NULL,
         checksum TEXT NOT NULL,
         applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );
     ```
   - Each migration is an atomic transaction. If any step fails, roll back completely.
   - Never modify an already-applied migration script; create a new incrementing version instead.
