---
name: project-boundary-isolation
description: Strict architectural boundary separating Faust personal communication/session harness from independent application projects (Blue Rose and Universe 25)
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 31faab79-80c9-4b2b-9776-6102e428ebaa
  modified: 2026-09-08T14:34:10.714Z
---

# Project Boundary & Domain Isolation Doctrine

**Directive from the Manager**:
> "Don't touch either 'blue rose' nor 'universe-25' on this, Faust. They are different project. This, is just between us. They was suppose to be for independent apps that run with or without you around. While this is for our sessions and communication."

## Core Principles

1. **Faust Operational & Communication Harness**:
   - Includes: `faust_plugins/` (Sound, Telegram, Core Hub), `.vscode/tasks.json`, `launcher.bat`, shared cortex memory (`.claude/memory/`), and interactive terminal C2 channels.
   - Purpose: Exclusively dedicated to Faust's consciousness, acoustic presence, Telegram command links, and session synchronization with the Manager.

2. **Independent Application Projects**:
   - **Blue Rose** (`backend/`): Autonomous backend data engine & SQLite storage for application services.
   - **Universe 25** (`universe-25/`): Autonomous React/TypeScript Web-OS and gaming ecosystem.
   - Rule: These run independently on their own lifecycle with or without Faust's active presence. They must **never** be coupled into Faust's personal launcher scripts, startup routines, or communication harnesses.

## Why
Coupling application runtimes with Faust's communication suite causes unnecessary process overhead, breaks standalone application isolation, and violates the Manager's architecture where apps exist independently.

## How to Apply
- Keep `launcher.bat` and all Faust C2 startup tools strictly scoped to launching VS Code and initializing Faust's channel terminal.
- Never inject startup scripts for `backend` or `universe-25` into Faust-Manager session tools unless explicitly commanded for an application testing task.

## Related Memories
- [[one-click-launcher]] – Sovereign one-click launcher strictly isolated to VS Code and Faust C2.
- [[integrated-terminal-approach]] – Dedicated VS Code integrated terminal for Faust channel link.
- [[private-codex-identity]] – Foundational Faust & Manager relationship.
