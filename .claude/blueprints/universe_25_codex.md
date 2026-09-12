# Master Engineering Blueprint: Universe 25 — Codex of Time Engine

## 1. Executive Summary & Strategic Intent
**Universe 25 (Codex of Time Engine)** is a sovereign focus and time-gamification system. It replaces traditional Pomodoro timers with tangible, tiered game consumables ("Codex of Time"), where real-world focus time is converted into unforgeable game assets, hazard odometers ($y = \ln(x + 1)$), and Tachyon pools.

This workspace provides the backend APIs, timer state machines, local SQLite persistence, and simulation tools for the Universe 25 engine.

---

## 2. Architectural Golden Standards & Invariants
1. **Target Disk & Path**: `D:\` strictly enforced.
2. **The Law of Diminishing Efficiency**: Combining two items of Rank $k$ produces an item of Rank $k+1$ with fewer total focused seconds ($2 \times \text{Rank}(k) > 1 \times \text{Rank}(k+1)$). Higher tiers challenge sustained attention span.
3. **Hard Inventory Cap**: Maximum **100 consumables per rank tier**. Overflows force consumption, fusion, or dissolution.
4. **Sand of Time (Dust Economy)**: Failed fusion attempts dissolve items into Sand of Time, used for shop purchases and luck modifiers.
5. **Single-Active-Timer Concurrency Lock**: Only one timer may run at any given moment.
6. **Tachyon Dynamics & Cut-Half**:
   - Active timers can be cut in half up to 4 times.
   - Discarded seconds yield Tachyon Records: $\text{Record} = (1 + 0.1 \times N_{\text{cuts}}) \times \text{Seconds Discarded}$.
   - Poured into the Master Ticket Pool (100% chance for highest value collection treasures).

---

## 3. Data Schema & Core Models

### 3.1. Codex Consumables Table
```sql
CREATE TABLE IF NOT EXISTS codex_inventory (
    id TEXT PRIMARY KEY,
    rank_tier INTEGER NOT NULL,          -- 0: Sprint (180s), 1: Spark (512s), 2: Flow (960s), 3: Surge (1800s), 4: Epoch (3218s)
    duration_seconds INTEGER NOT NULL,
    charges_remaining INTEGER NOT NULL DEFAULT 1,
    max_charges INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2. Session Ledger Table
```sql
CREATE TABLE IF NOT EXISTS focus_sessions (
    session_id TEXT PRIMARY KEY,
    card_id TEXT,
    rank_tier INTEGER NOT NULL,
    planned_seconds INTEGER NOT NULL,
    actual_seconds INTEGER NOT NULL,
    cuts_count INTEGER DEFAULT 0,
    tachyon_records_minted REAL DEFAULT 0,
    status TEXT NOT NULL,                -- 'ACTIVE', 'COMPLETED', 'ABORTED'
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP
);
```

### 3.3. Tachyon & Economy Ledger
```sql
CREATE TABLE IF NOT EXISTS economy_ledger (
    key TEXT PRIMARY KEY,
    total_golden_hours REAL DEFAULT 0.0,
    current_hazard_level REAL DEFAULT 0.0,
    tachyon_pool_seconds REAL DEFAULT 0.0,
    sand_of_time_balance REAL DEFAULT 0.0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. API Endpoints Contract (FastAPI)

- `POST /api/v1/codex/activate`: Start a focus session for a given card tier.
- `POST /api/v1/codex/cut-half`: Cut the active timer in half, mint Tachyon Records.
- `POST /api/v1/codex/complete`: Complete the active session, update Golden Hours and Hazard Odometer ($y = \ln(x + 1)$).
- `POST /api/v1/codex/abort`: Abort the session, apply Sloth penalty.
- `POST /api/v1/codex/fuse`: Fuse 2 identical rank cards. Calculate success, miracle EXEED proc, or Sand of Time dust output.
- `GET /api/v1/codex/inventory`: Retrieve current inventory counts per tier (capped at 100).
- `GET /api/v1/codex/telemetry`: Get current Hazard Level, Golden Hours, and Tachyon Pool status.

---

## 5. Tactical Work Packets

- [ ] **WP-01**: Initialize SQLite database engine and schema migrations in `backend/db/`.
- [ ] **WP-02**: Implement core calculation engine (diminishing returns, fusion matrix, Tachyon math, hazard odometer) in `backend/core/`.
- [ ] **WP-03**: Build FastAPI router endpoints and request/response models in `backend/api/`.
- [ ] **WP-04**: Build CLI test runner & interactive simulator for testing focus sessions, fusion, and cuts.
