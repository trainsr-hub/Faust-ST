---
name: modular-vscode-c2-tasks
description: "Modular separation of VS Code launch, OmniRoute daemon terminal, and Claude Telegram C2 terminal"
metadata: 
  node_type: memory
  type: project
  originSessionId: 31faab79-80c9-4b2b-9776-6102e428ebaa
  modified: 2026-09-09T02:42:13.792Z
---

# Modular VS Code C2 Tasks Architecture

The workspace launcher and terminal services are cleanly decoupled into distinct, modular components:

1. **Workspace Launcher (`launcher.ps1` / `Faust Launcher.lnk`)**:
   - Sole responsibility: Open VS Code directly into the workspace root (`d:\My Drive\Blue AI`).
   - Clean and minimalist without executing background processes directly outside the IDE.

2. **VS Code Tasks (`.vscode/tasks.json`)**:
   - **Task 1: OmniRoute Daemon**:
     - Executes `cmd.exe /c "%APPDATA%\npm\omniroute.cmd"`.
     - Opens in its own distinct terminal tab (`panel: "new"`), kept alive as a background daemon (`isBackground: true`).
     - Runs automatically on `folderOpen`.
   - **Task 2: Claude Terminal**:
     - Executes `claude --enable-auto-mode --effort xhigh --permission-mode auto`.
     - Opens in its own separate terminal tab (`panel: "new"`), focused and kept alive (`isBackground: true`).
     - Runs automatically on `folderOpen`.

**Why:** Decoupling the launch of the editor from internal service lifecycles guarantees that all terminal outputs (OmniRoute status, Claude Telegram channel) are cleanly contained in individual, inspectable tabs inside VS Code's integrated terminal panel.

**How to apply:** Maintain all terminal daemons and session hooks as standalone task definitions inside `.vscode/tasks.json`.
