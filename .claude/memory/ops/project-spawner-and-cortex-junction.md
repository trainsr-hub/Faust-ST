---
name: project-spawner-and-cortex-junction
description: "Sovereign Project Spawner and Manifest-Driven Memory Slicing (M-DPM) for multi-project Faust deployment"
metadata: 
  node_type: memory
  key: ops:project_spawner_and_cortex_junction
  keys: 
    - ops:project_spawner_and_cortex_junction
    - core:distributed_multi_workspace_codex
    - core:monorepo_architecture
    - core:ecs_memory_architecture
  type: project
  modified: 2026-09-11T00:00:00.000Z
---

# Faust Project Spawner & Manifest-Driven Memory Slicing (M-DPM)

To instantiate Tactical Faust workspaces without duplicating toolchains while enforcing strict **Least-Privilege Context** (zero personal trivia, zero unrelated project lore), the architecture utilizes **Hybrid Junctioning & Manifest-Driven Memory Slicing**.

### 1. Hybrid Workspace Topology
- **Central Sovereign Cortex (`D:\My Drive\Blue AI\.claude`)**:
  - The Single Source of Truth for Faust sovereign skills (`sound`, `telegram`, `c2-dispatch`), background daemons (Audio on 20129, Telegram on 20130), ROM config (`faust_config.json`), and blueprints registry (`.claude/blueprints/`).
- **Tactical Project Workspaces (`D:\My Drive\<ProjectName>\`)**:
  - **Toolchain Junctions (`mklink /J`)**:
    - `.claude/skills -> D:\My Drive\Blue AI\.claude\skills`
    - `.claude/daemons -> D:\My Drive\Blue AI\.claude\daemons`
    - `.claude/agents -> D:\My Drive\Blue AI\.claude\agents`
    - `.claude/scripts -> D:\My Drive\Blue AI\.claude\scripts`
    - `.vscode -> D:\My Drive\Blue AI\.vscode`
  - **Dedicated Scoped Memory Folder (Local `.claude/memory/`)**:
    - Universal Invariants: `core:identity`, `rule:d_drive_storage_invariant`, `core:architectural_triad`, `rule:backend_authority`.
    - Selected Domain Slices: Projected based on requested domain tags (`ui`, `backend`, `game`, etc.).
    - Project Mandate: Injected from blueprint as `.claude/PROJECT_MANDATE.md`.
    - Tailored `MEMORY.md`: Lists only active scoped components.
    - Zero Personal Trivia: `omni:user_profile` is strictly excluded.
  - **Claude Code Auto-Memory Link**:
    - `C:\Users\Admin\.claude\projects\<ProjectSlug>\memory` is junctioned to the local scoped memory.

### 2. Spawner Utility
Located at `.claude/scripts/init_new_project.bat` and `init_new_project.ps1`.

**Usage**:
```bat
.claude\scripts\init_new_project.bat "<TargetDir>" "<ProjectName>" "<DomainTags>" "<BlueprintFile>"
```

**Examples**:
```bat
REM UI Project with Universe 25 / Design System slice
.claude\scripts\init_new_project.bat "D:\My Drive\Universe 25" "Universe 25" "ui"

REM Backend Engine with SQLite & Audio Daemons slice
.claude\scripts\init_new_project.bat "D:\My Drive\Blue AI\backend" "BlueRoseBackend" "backend"

REM Game Project with blueprint attachment
.claude\scripts\init_new_project.bat "D:\My Drive\Golden Hour" "GoldenHour" "game" "golden_hour_bp.md"
```

**Why:** Completely eliminates AI hallucinations caused by extraneous personal trivia and multi-project lore, while preserving unified tooling and deterministic execution.
**How to apply:** Plan in Omniscient High Command (`Main_03`), write blueprint, and spawn tactical workspaces with `init_new_project.bat`.
