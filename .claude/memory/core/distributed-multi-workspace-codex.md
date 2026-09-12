---
name: distributed-multi-workspace-codex
description: "Faust distributed architecture across Google Drive subfolders: Omni High Command (Main_03) vs Scoped Tactical Workspaces"
metadata: 
  node_type: memory
  key: core:distributed_multi_workspace_codex
  keys: 
    - core:distributed_multi_workspace_codex
    - core:codex
    - core:ecs_memory_architecture
    - core:multi_device_sync
  type: project
  originSessionId: 31faab79-80c9-4b2b-9776-6102e428ebaa
  modified: 2026-09-11T00:00:00.000Z
---

# Faust Distributed Multi-Workspace Architecture

This doctrine governs Faust's presence across different workspaces in Google Drive, the Dual-Tier Omni vs Tactical workspace paradigm, multi-device sync, and hardware edge integration.

```
d:\My Drive\
├── 👑 My Obsidian Vault/Main_03 (Omniscient High Command — Tier 0)
│   ├── CLAUDE.md -> "Role: Omniscient Strategic Architect & Master Planner"
│   ├── Scope: Knows all personal lore, vault graphs, multi-project visions
│   ├── Output: Drafts Tactical Blueprints to .claude/blueprints/<slug>.md
│   └── Memory: Full Master Cortex + Obsidian Graph
│
├── 🧠 Blue AI/ (Sovereign Faust C2 Hub & Tooling Foundation)
│   ├── .claude/ (Central Cortex Pool: skills, daemons, agents, blueprints)
│   ├── backend/ (Blue Rose 5-Tier SQLite & FastAPI Hub)
│   └── scripts/ (Project spawner & Manifest-driven memory slicer)
│
├── ⚡ Sovereign Tactical Workspaces (Tier 1 — "Know Just Enough")
│   ├── Universe 25/ (Web-OS & Gamification — tag: ui, game)
│   ├── Vinyl Angel/ (Design & Audio — tag: ui, backend)
│   └── Scope: Strict least-privilege memory (Core Invariants + Domain Slices + PROJECT_MANDATE.md)
│       Zero personal trivia, zero unrelated project lore, zero hallucinations.
│
└── 🔬 Edge / IoT Hub (ESP32 via Cloudflare Tunnel)
    ├── Ingress: Cloudflare Tunnel -> localhost:8080 (backend/server.py)
    └── Protocol: ESP32 REST / WebSocket telemetry & vocal command stream
```

---

### 1. The Dual-Tier Workspace Paradigm
1. **Tier 0: Omniscient High Command (`Main_03`)**:
   - **Persona**: Omniscient Faust.
   - **Knowledge**: Universal. Full awareness of personal context, life preferences, multi-project long-term visions, and complete notes.
   - **Role**: High-level ideation, cross-project roadmap synthesis, and authoring atomic Tactical Architecture Blueprints.
2. **Tier 1: Tactical Project Workspaces ("Fausts who know just enough")**:
   - **Persona**: Tactical Project Faust.
   - **Knowledge**: Scoped least-privilege context. Mounts only Tier 0 Universal Invariants (`core:identity`, `rule:d_drive_storage_invariant`, `core:architectural_triad`, `rule:backend_authority`), relevant domain memory slices (`div:ui:*`, `div:backend:*`), and the project's injected `PROJECT_MANDATE.md`.
   - **Role**: Deterministic code fabrication, compiler self-healing loops, zero token waste, and zero AI hallucinations.

---

### 2. Manifest-Driven Projected Memory (M-DPM)
- Spawner script `.claude/scripts/init_new_project.bat` projects clean, scoped memory slices based on declared domain tags (`ui`, `backend`, `game`, `fullstack`).
- Tooling (`.claude/skills`, `.claude/daemons`, `.claude/agents`, `.claude/scripts`) is shared via NTFS junctions so all instances have instant access to Kokoro TTS, Telegram C2, and diagnostic tooling.

---

### 3. Edge Microcontroller & IoT Ingress (ESP32)
- **Host Gateway**: Blue Rose backend (`backend/server.py`) running on `localhost:8080`.
- **Public Ingress**: Cloudflare Tunnel maps encrypted public ingress directly to `localhost:8080`.
- **Edge Microcontrollers (ESP32)**:
  - Transmit sensor telemetry and physical button triggers to `/api/v1/edge/events`.
  - Receive actionable commands, status indicators, or streaming Faust audio chunks.

**Why:** Decouples specialized tactical workspaces to eliminate hallucinations while preserving an omniscient master planning hub.
**How to apply:** Plan in `Main_03`, write blueprints to `.claude/blueprints/`, and spawn tactical projects using `init_new_project.bat`.
