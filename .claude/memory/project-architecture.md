---
name: project-architecture
key: core:monorepo_architecture
keys:
  - core:monorepo_architecture
  - core:codex
  - core:plugin_architecture
  - core:warfare_c2_doctrine
  - core:multi_combo_routing_matrix
description: Blue AI workspace structure — sovereign Faust C2 intelligence hub, Blue Rose storage engine, and isolated external application boundary
metadata: 
  node_type: memory
  type: project
---

# Blue AI Workspace Architecture

The workspace root `D:\My Drive\Blue AI\` is the sovereign intelligence and command hub for Faust serving the Manager across multiple devices.

## 1. Sovereign Faust Subsystems & Plugins (`faust_plugins/` & `.claude/skills/`)
- **Acoustic Core (`.claude/skills/sound/` & `faust_plugins/sound.py`)**: Neural TTS (Kokoro-82M ONNX) with $O(1)$ voice blending, speed-compensated Fourier pitch shift, dynamic normalization, and sample-accurate silence pauses.
- **Telegram C2 (`.claude/skills/telegram/` & `faust_plugins/telegram.py`)**: 4-phase operational command link listener, execution thread, and HTML notification dispatcher.
- **C2 Multi-Combo Dispatcher (`.claude/skills/c2-dispatch/` & `scripts/faust_dispatcher.py`)**: Programmatic task shredder, SHA-256 validator, and self-healing compiler loop runner.

## 2. 4-Tier Multi-Combo Multi-Agent Hierarchy (`.claude/agents/`)
- **Tier 1 (Faust-ST)**: User Interface & Context Router (Intelligent Auto, intent parsing, HITL gates, vocalization).
- **Tier 2 (Faust-ND)**: Lead Architect (`faust-theorist` - Sonnet Thinking) & Adversarial Inquisitor (`faust-critic` - Flash High).
- **Tier 3 (Faust-RD)**: Deterministic Logistics Layer (`faust-operator` & `scripts/faust_dispatcher.py`).
- **Tier 4 (Faust-TH)**: Tactical Factory Floor Machinists (`faust-machinist-logic` & `faust-machinist-ui` - Haiku/Qwen/Llama with self-healing compiler loops).

## 3. Authoritative Storage Engine: `backend/`
- **Port**: 8080 (`python backend/run_backend.py`)
- **Framework**: Python FastAPI
- **Domain**: Authoritative single source of truth for persistent SQLite databases and state tiers.
- **Data Engine**: 5-tier SQLite data model (`_1_static.db`, `_2_events.jsonl`, `_3_state.db`, `_4_display.db`, `_5_config.db`).
- **API**: Transactional endpoint `POST /api/v1/execute` with `{ project_id, tier, order: { action, data } }`.

## 4. Shared Memory Cortex: `.claude/memory/`
- Data-driven ECS memory components indexed by Key IDs in `MEMORY.md`.
- Synchronized across workstations (Desktop base and laptop) via Google Drive and NTFS directory junctions.

## 5. External Application Boundary
- Sandbox and client applications (such as Universe 25 and external web apps) are decoupled from Faust's sovereign workspace. They consume Faust's backend API and Telegram links as external clients without polluting Faust's core C2 code tree.

See [[faust-multi-combo-routing-matrix]] for 4-tier combo mappings.
See [[faust-plugin-architecture]] for plugin design.
See [[project-boundary-isolation]] for project boundary isolation.
