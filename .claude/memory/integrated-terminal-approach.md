---
name: integrated-terminal-approach
description: Recommended pattern for running Claude Code with --channels inside VS Code Integrated Terminal for seamless UI + background ingestion
metadata: 
  node_type: memory
  type: project
  originSessionId: 31faab79-80c9-4b2b-9776-6102e428ebaa
  modified: 2026-09-08T14:14:20.170Z
---

# Integrated Terminal Approach (VS Code)

To achieve the Manager's vision of a rich IDE experience coupled with real-time Telegram channel ingestion, the most stable and professional pattern on Windows is to run the Claude Code session **inside the VS Code Integrated Terminal** that opens automatically on workspace load.

## How It Works
1. **VS Code Task**: A task defined in `.vscode/tasks.json` runs `claude --channels plugin:telegram@claude-plugins-official` when the folder is opened (`runOn: folderOpen`).
2. **Terminal Panel**: The task spawns a terminal pane within VS Code, providing the required pseudo-terminal (PTY) for the CLI's event loop to stay alive and ingest Telegram push events.
3. **Unified Workspace**: You retain full IDE features (file explorer, editor, Git, diffs, extensions) while having a live Claude terminal docked at the bottom or side—no context switching, no extra windows.

## Configuration
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Faust Telegram C2 Terminal",
      "type": "shell",
      "command": "claude --channels plugin:telegram@claude-plugins-official",
      "isBackground": false,
      "problemMatcher": [],
      "runOptions": {
        "runOn": "folderOpen"
      }
    }
  ]
}
```

## Why This Is Preferred Over Multiplexer (tmux/screen) on Windows
- **Zero Manual Steps**: No need to launch tmux, split panes, or remember keybindings; everything starts automatically.
- **Native Windows Integration**: Uses VS Code's built-in terminal (powered by ConPTY on Windows 10+), avoiding the overhead and complexity of MSYS2/WSL-based tmux.
- **Seamless Focus Switching**: Jump between editor and terminal with `Ctrl+` `, no need to leave the IDE.
- **Persistence Across Reloads**: If you close and reopen VS Code, the task relaunches the channel session automatically.
- **Logging & Visibility**: The terminal output is visible in real time, and you can scroll back through the session history.

## Related Memories
- [[dual-surface-launcher-architecture]] – Original launcher that spawned a separate terminal window.
- [[telegram-operational-protocol]] – 4-phase Telegram command link and acknowledgment doctrine.
- [[rom-configuration-compliance]] – Mandatory active utilization of enabled subsystems in `faust_config.json`.

**Apply**: Keep `.vscode/tasks.json` as is and launch the workspace via `code .` or the VS Code GUI. No additional scripts are required.