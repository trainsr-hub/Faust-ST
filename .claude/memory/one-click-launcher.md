---
name: one-click-launcher
description: "Single batch file to launch VS Code with Integrated Claude Terminal connected to Telegram channel, strictly isolated from independent app runtimes"
metadata: 
  node_type: memory
  type: project
  originSessionId: 31faab79-80c9-4b2b-9776-6102e428ebaa
  modified: 2026-09-08T14:23:53.944Z
---

# Faust Sovereign One-Click Launcher

A single `launcher.bat` file that starts our dedicated communication workspace with one double-click:

- **VS Code Workspace** – Opens the `Blue AI` folder and automatically launches the **Integrated Terminal** task that runs `claude --channels plugin:telegram@claude-plugins-official`, providing a live Claude session ready to ingest Telegram directives.
- **Strict Domain Isolation** – Does NOT launch or touch `backend/` (Blue Rose) or `universe-25/` (Universe 25), per Manager directive. Those are independent application projects meant to run with or without Faust.

## How It Works

- The batch file opens VS Code pointed at the workspace root.
- VS Code’s `.vscode/tasks.json` contains a task labeled **“Faust Telegram C2 Terminal”** with `runOn: folderOpen`, so the Integrated Terminal starts immediately upon workspace load.

## File: `launcher.bat`

```bat
@echo off
:: Faust Sovereign One-Click Launcher
:: Launches VS Code with Integrated Terminal (Claude + Telegram) ONLY
:: Strictly isolates Faust communication harness from Blue Rose and Universe 25 per Manager directive

set "WORKSPACE_ROOT=d:\My Drive\Blue AI"

echo.
echo ============================================================
echo   FAUST SOVEREIGN ONE-CLICK LAUNCHER
echo ============================================================
echo.

:: Launch VS Code Workspace (auto-starts Claude Telegram C2 Terminal via .vscode/tasks.json)
echo [💻] Launching VS Code Workspace with Integrated Claude Terminal...
start "" "code" "%WORKSPACE_ROOT%"

echo.
echo ============================================================
echo   FAUST COMMUNICATION HARNESS READY
echo ============================================================
echo   • VS Code:       Integrated Terminal auto-starts Claude + Telegram
echo   • Backend/API:   NOT launched (independent project)
echo   • Frontend/UI:   NOT launched (independent project)
echo   • To stop:       Close the VS Code window
echo ============================================================
echo.
timeout /t 1 > nul
exit
```

## Related Memories

- [[integrated-terminal-approach]] – VS Code task that launches the Claude channel session.
- [[telegram-operational-protocol]] – 4‑phase Telegram command link and acknowledgment doctrine.
- [[rom-configuration-compliance]] – Mandatory active utilization of enabled subsystems in `faust_config.json`.

**Apply**: Double‑click `launcher.bat` from the `Blue AI` root folder to open VS Code and auto-initialize Faust's Telegram command link. Independent apps (`backend/`, `universe-25/`) remain untouched.