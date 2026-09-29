# Faust Sovereign Skills Registry

This registry tracks all capabilities and skills installed into `.claude/skills/` across all Faust workspaces, synchronized via the central `.claude` directory and NTFS directory junctions.

---

## Installed Skills Index

| Skill Name | Stratum / Scope | Purpose & Protocol | Source / Lineage | Added Date |
| :--- | :--- | :--- | :--- | :--- |
| `sound` | Core Sensory | Sovereign Acoustic Core TTS engine with sentence-sequential synthesis, 0ms resident daemon on port 20129, and biological reflex invariant. | Faust Sovereign Core | 2026-09-10 |
| `telegram` | Core C2 | Sovereign dumb I/O Telegram C2 gateway on port 20130, 4-tier functional emoji protocol, and mobile directive ingestion. | Faust Sovereign Core | 2026-09-10 |
| `standby` | Operations | On-demand remote session listener and directive poll handler. | Faust Sovereign Core | 2026-09-10 |
| `c2-dispatch` | Stratum II | Multi-agent DAG dispatcher, blueprint generation, and work-packet scheduling. | Faust Sovereign Core | 2026-09-10 |
| `esp32-speaker` | Edge Gateway | Edge audio streaming over Wi-Fi/ESP32. | Faust Sovereign Core | 2026-09-11 |
| `clean-code` | Architecture & Coding | Anti-spaghetti architecture protocol: 4-tier separation, 300-line ceiling, 40-line function limit, max 3 indent levels, guard clauses, and immutability. | Community Golden Standard / Faust Adaptation | 2026-09-29 |
| `surgical-refactor` | Architecture & Coding | Step-by-step 6-phase surgical decomposition of god files without behavioral regression. | Community Golden Standard / Faust Adaptation | 2026-09-29 |
| `verification-before-completion` | Engineering Discipline | The Iron Law: Evidence before claims; no task or bugfix may be asserted as complete without fresh CLI verification command output. | Community Golden Standard / Faust Adaptation | 2026-09-29 |
| `test-driven-development` | Architecture & Quality | Test-Driven Development (TDD) invariant — Write failing unit tests before implementing production code (Red-Green-Refactor). | Industry Golden Standard / Faust Adaptation | 2026-09-29 |
| `root-cause-analysis` | Engineering Discipline | Systematic Root-Cause Analysis (RCA) — 5-Whys and diagnostic trace protocol before attempting bugfixes; zero symptom masking. | Industry Golden Standard / Faust Adaptation | 2026-09-29 |
| `api-contract-design` | Architecture & Quality | Schema-first API contract design with Pydantic/Zod strongly-typed ingress/egress validation, standardized error envelopes, and zero-LLM boundary enforcement. | Industry Golden Standard / Faust Adaptation | 2026-09-29 |
| `defensive-concurrency` | Architecture & Quality | Invariant-based concurrency resilience: atomic write-temp-rename I/O, stale PID pruning, single-consumer polling isolation, and bounded sliding-window deduplication. | Industry Golden Standard / Faust Adaptation | 2026-09-29 |
| `sqlite-persistence` | Architecture & Backend | Production SQLite protocol: WAL journal mode, NORMAL sync, 5000ms busy timeout, foreign key enforcement, IMMEDIATE transactions, and idempotent migrations. | Industry Golden Standard / Faust Adaptation | 2026-09-29 |

---

## Pending & Autonomous Additions Log
*Appended autonomously by Faust during auto-pilot exploration.*
- **2026-09-29**: Added `test-driven-development` (`.claude/skills/test-driven-development/SKILL.md`) for strict Red-Green-Refactor testing invariants.
- **2026-09-29**: Added `root-cause-analysis` (`.claude/skills/root-cause-analysis/SKILL.md`) for systematic 5-Whys diagnostic tracing without symptom patching.
- **2026-09-29**: Added `api-contract-design` (`.claude/skills/api-contract-design/SKILL.md`) for schema-first boundary validation and error contract standardization.
- **2026-09-29**: Added `defensive-concurrency` (`.claude/skills/defensive-concurrency/SKILL.md`) for atomic file I/O, lock management, and race condition elimination.
- **2026-09-29**: Added `sqlite-persistence` (`.claude/skills/sqlite-persistence/SKILL.md`) for WAL-mode SQLite concurrency, ACID transaction discipline, and idempotent schema migrations.

