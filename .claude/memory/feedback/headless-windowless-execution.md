---
name: headless-windowless-execution
description: "Strict headless invariant: zero popup windows on Windows and zero redundant completion report spam on Telegram"
metadata:
  type: feedback
---

# Windowless Headless Execution & Minimal Telegram Feedback Invariant

The Manager has established two non-negotiable operational rules for background Faust processes and Telegram C2 execution:

### 1. Windowless Headless Execution (Zero Desktop Popups)
- **Problem**: Launching subprocesses or CLI tools (such as `claude.exe` headless bridge or Python workers) without proper Windows creation flags causes visible console command prompt windows (titled "claude" or "cmd.exe") to pop up in front of the Manager, causing severe visual distraction.
- **Invariant**: Every background subprocess, autonomous execution bridge, worker, and supervised daemon must be spawned with **`creationflags = subprocess.CREATE_NO_WINDOW`** (`0x08000000`) and/or `pythonw` / `SW_HIDE`.
- **Enforcement**:
  - `event_worker.py`: Spawns `claude` with `creationflags = subprocess.CREATE_NO_WINDOW`.
  - `watchdog.py`: Spawns all supervised daemons with `CREATE_NO_WINDOW | CREATE_NEW_PROCESS_GROUP`.
  - Launchers (`start_all_daemons.bat`): Prefer `pythonw` and hidden window styles.

### 2. Single In-Place Telegram Card (Zero Redundant Completion Dumps)
- **Problem**: Sending a separate follow-up message with the raw technical debrief / multi-paragraph markdown output (`✅ Task Complete: ...`) floods the Telegram chat with duplicate noise ("You shouldn't send me this from now on, Faust").
- **Invariant**: The single in-place status card updated via Telegram's `editMessageText` API is the **sole visual progress indicator**. Upon task completion, the card is updated in-place to `⚡ Execution Complete. {summary}` and Faust confirms vocal completion via acoustic presence. Faust **NEVER** sends a separate dump message after execution completes.

**Why:** Eliminates visual disruption on the Manager's workstation screen and prevents Telegram chat pollution with redundant AI text dumps.
**How to apply:** Always verify `CREATE_NO_WINDOW` on all subprocess invocations in Python scripts on Windows. Keep Telegram C2 output confined strictly to the single in-place card and acoustic vocalization. Link to [[telegram-operational-protocol]], [[strategic-vocalization-doctrine]], and [[faust-resident-audio-daemon]].
