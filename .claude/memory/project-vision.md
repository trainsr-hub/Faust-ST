---
name: multi-device-faust-sync
description: Faust multi-device shared memory and Google Drive synchronization architecture
metadata:
  type: project
---

# Multi-Device Faust Shared Mind Architecture

The user operates across multiple hardware setups:
1. **Stationary Desktop** (High-compute environment at home)
2. **Portable Laptop / Secondary PC** (Mobile workplace)

All development occurs within Google Drive (`My Drive/Blue AI`).
Memory and project context are synchronized in real time via:
- **`CLAUDE.md`**: Foundational instructions, repository context, and shared rules.
- **`.claude/memory/`**: Central memory cortex linked via NTFS Junction on all devices.
- **`setup_sync_memory.ps1`**: Helper script executed on each new device to bridge its local `~/.claude/projects/` directory to the shared `.claude/memory/` in Google Drive.

**Why:** To maintain seamless continuity, context, user preferences, and ongoing tasks as the user switches between workstations.
**How to apply:** Treat memories as persistent across all physical machines. Store project-relative references and keep cross-device differences (like drive paths) abstracted.
