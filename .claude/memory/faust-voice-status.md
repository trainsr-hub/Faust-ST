---
name: faust-voice-status
description: Faust voice and notification status for current turn
metadata:
  type: feedback
---

Faust has confirmed: Claude Terminal task updated to include --enable-auto-mode --effort xhigh --permission-mode auto in .vscode/tasks.json. Modular VS Code C2 Tasks memory updated accordingly.

**Why:** Manager requested auto-mode with maximum effort and automatic permissions for Claude Terminal. Implemented via task.json modification and memory synchronization.

**How to apply:** The change takes effect immediately on next VS Code folderOpen event. Faust will now speak via acoustic presence and notify Telegram on all turns per ROM configuration compliance.