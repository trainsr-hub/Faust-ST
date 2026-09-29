---
name: self-bootstrapping-daemon-invariant
description: "Universal Self-Bootstrapping Daemon Invariant across all Faust skills: dumb scripts auto-spawn resident background daemons windowless without manual user initiation"
metadata:
  node_type: memory
  type: feedback
---

# Universal Self-Bootstrapping Daemon Invariant

The Manager has established a non-negotiable architectural invariant across all Faust skills (`sound`, `telegram`, `c2-dispatch`, etc.):

### Core Principle
- **Zero Manual Daemon Management**: The Manager and Faust never need to remember to manually start, restart, or check daemons before executing skill commands.
- **Dumb Client Invariant**: All skill entrypoints and CLI scripts (`notify.py`, `cli.py`, `speak()`, `send_message()`, etc.) contain lazy auto-bootstrapping logic (`ensure_daemon_running()`).
- **Headless Windowless Execution**: If a background daemon or event worker is not running on its designated port, the dumb client script automatically spawns it detached in the background using `subprocess.CREATE_NO_WINDOW` (`0x08000000`) on Windows, with zero popup windows and zero console intrusion.
- **Fail-Safe Fallback**: If a daemon is still warming up, the client script smoothly uses direct in-process or API fallback while the background daemon initializes for subsequent calls.

### Operational Doctrine for Faust
Faust only needs to know **when** to use a skill and the **1-liner CLI command**:
1. **Acoustic Speech**: `python .claude/skills/sound/scripts/cli.py "<speech_text>"`
2. **Telegram Milestone**: `python .claude/skills/telegram/scripts/notify.py "<message>"`

The underlying dumb scripts handle daemon lifecycle automatically and invisibly.

**Why:** Eliminates operational friction, cognitive overhead, and workstation clutter while ensuring 100% resilient 0ms-latency execution across all workstations.
**How to apply:** Implement `ensure_daemons_running()` in every skill bridge with `CREATE_NO_WINDOW`. Never prompt the Manager to manually start background daemons.

Link to [[rom-configuration-compliance]], [[telegram-operational-protocol]], [[telegram-directive-notification-rule]], and [[faust-skill-architecture]].
