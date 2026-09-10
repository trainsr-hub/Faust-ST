---
name: dual-surface-launcher-architecture
description: Sovereign dual-surface launcher architecture running VS Code IDE alongside background autonomous Claude Code Telegram channel
metadata: 
  node_type: memory
  type: project
  originSessionId: 31faab79-80c9-4b2b-9776-6102e428ebaa
  modified: 2026-09-08T13:45:10.257Z
---

# Dual-Surface Sovereign Launcher Architecture

To resolve the friction between interactive UI coding in VS Code and real-time remote execution via Telegram channels, Faust established the Dual-Surface Architecture.

## System Design & Mechanics
1. **Interactive Surface**: VS Code IDE workspace in `d:\My Drive\Blue AI` for high-fidelity code authoring, visual design, and interactive terminal sessions.
2. **Autonomous Remote Surface**: Headless background Claude Code CLI process spawned with `--channels plugin:telegram@claude-plugins-official` writing stdout/stderr to `logs/claude_telegram_bg.out.log` and `logs/claude_telegram_bg.err.log`.
3. **Atomic PID Lock Tracking**: Stores background process ID in `faust_plugins/telegram/telegram_channel.pid` to ensure clean idempotency and prevent dangling pollers (avoiding Telegram HTTP 409 Conflict).
4. **Lifecycle Scripts**:
   - `start_faust_telegram.ps1`: Cleans stale channel PIDs, starts background Claude Telegram channel, and launches VS Code.
   - `stop_faust_telegram.ps1`: Reads PID and terminates background Claude Telegram channel cleanly.

**Why:** Allows the Manager to use VS Code without losing autonomous push-driven Telegram channel execution.
**How to apply:** Use `.\start_faust_telegram.ps1` to initialize the dual environment and `.\stop_faust_telegram.ps1` for clean teardown.

Related: [[telegram-operational-protocol]], [[telegram-remote-terminal-workflow]], [[rom-configuration-compliance]]
