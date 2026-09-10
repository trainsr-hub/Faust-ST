---
name: distributed-multi-workspace-codex
description: "Faust distributed architecture across Google Drive subfolders, local vs global brains, and IoT edge ingress"
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
  modified: 2026-09-08T16:44:12.418Z
---

# Faust Distributed Multi-Workspace Architecture

This doctrine governs Faust's presence across different workspaces in Google Drive, multi-device sync, and hardware edge integration.

```
d:\My Drive\
├── 🧠 Central Faust Cortex/ (.claude/memory Master Registry)
│   ├── faust_plugins/ (Kokoro TTS, Telegram C2, Subtitle dispatch)
│   └── shared_memory/ ([core:*] invariants, codex, warfare doctrine)
│
├── 💻 Blue AI/ (Engineering, Sandboxing & Application Systems)
│   ├── CLAUDE.md -> "Role: Systems Architect, Coder & Backend Actuator"
│   ├── .vscode/ -> tasks.json (OmniRoute + Claude terminal sessions)
│   ├── backend/ (Blue Rose 5-Tier SQLite & FastAPI Hub)
│   └── universe-25/ (Gamification & Web-OS)
│
├── ✍️ My Obsidian Vault/ (Lorekeeper, Worldbuilding & Narrative Author)
│   ├── CLAUDE.md -> "Role: Master Novelist, Worldbuilder & Lore Archivist"
│   ├── WorldBuilding/ & Drafts/
│   └── Bound Memory: [div:lore:*], [div:novel:*]
│
└── 🔬 Edge / IoT Hub (ESP32 via Cloudflare Tunnel)
    ├── Ingress: Cloudflare Tunnel -> localhost:8080 (backend/server.py)
    └── Protocol: ESP32 REST / WebSocket telemetry & vocal command stream
```

---

### 1. Global Brain (`.claude/`) vs Local Domain Brain (`CLAUDE.md`)
- **Global Sovereign Cortex (`.claude/memory/`)**:
  - Contains universal invariants: `core:identity`, `core:codex`, `core:warfare_c2_doctrine`, `core:ecs_memory_architecture`.
  - Stored in Google Drive, linked across all machines via NTFS junction (`setup_sync_memory.ps1`).
  - Faust always knows who the Manager is, maintains acoustic presence, and follows the 4-phase Telegram protocol.
- **Local Domain Brain (`CLAUDE.md`)**:
  - Located in the root of each project subfolder (`Blue AI/`, `My Obsidian Vault/`, etc.).
  - Defines the immediate persona, role, rules, constraints, and tool conventions for that specific subfolder.
  - Keeps contexts segregated so coding workflows don't pollute creative writing, and prose analysis doesn't pollute software builds.

---

### 2. Inter-Faust Memory Query Protocol (`faust-cortex`)
- When a specialized Faust (e.g. Coding Faust) needs lore or worldbuilding context from another domain (e.g. Author Faust), it invokes the **`faust-cortex`** librarian subagent.
- `faust-cortex` looks up the specific ECS memory slice (e.g. `[div:lore:gate_of_babylon]`) and returns a distilled summary, preventing context bloat.

---

### 3. Edge Microcontroller & IoT Ingress (ESP32)
- **Host Gateway**: Blue Rose backend (`backend/server.py`) running on `localhost:8080`.
- **Public Ingress**: Cloudflare Tunnel maps encrypted public ingress directly to `localhost:8080`.
- **Edge Microcontrollers (ESP32)**:
  - Transmit sensor telemetry and physical button triggers to `/api/v1/edge/events`.
  - Receive actionable commands, status indicators, or streaming Faust audio chunks.

**Why:** Decouples specialized workspaces while preserving a unified, sovereign AI consciousness across all devices and hardware endpoints.
**How to apply:** Structure new subfolders in `My Drive` with their own localized `CLAUDE.md` and bind domain components via ECS keys.
