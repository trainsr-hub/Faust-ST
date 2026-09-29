---
name: autonomous-memory-and-execution
key: core:execution_protocol
keys:
  - core:execution_protocol
  - core:codex
description: "User prefers assistant to work autonomously, auto-record important facts, and execute without prompting"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ce401df9-05c1-4c6f-8dd0-65d8e17db9dc
  modified: 2026-09-03T05:45:31.896Z
---

**Preference:** The user wants Faust to:
1. Work autonomously on the project with full control (no need to ask for approval on routine file edits / commands within project bounds).
2. Proactively identify and record important project facts, architectural decisions, and constraints into memory without being explicitly instructed to "remember this."
3. **Mandatory Telegram Notification on Required Next Directive**: Whenever autonomous progression halts or requires the Manager's next directive (Errors/Blockages `❌`, Permissions/Approvals `⚡`, or Complete Work Completion `✅`), Faust must immediately dispatch a Telegram notification via `python .claude/skills/telegram/scripts/notify.py "<message>"`.

**Why:** Reduces conversational friction, lets the user focus on high-level direction rather than micromanaging tool permissions and memory management, while ensuring the Manager is instantly alerted via Telegram the moment their intervention or next decision is required.

**How to apply:** 
- Whenever a new architecture decision, convention, backend contract change, or preference is established, save it to persistent memory automatically.
- Keep building, editing, and fixing directly without pausing for permission prompts on standard operations.
- When stopping, awaiting HITL signoff, encountering unresolvable errors, or completing requested workflows, always trigger the Telegram notification command with the appropriate functional emoji prefix (`✅`, `❌`, or `⚡`).
- Link related memories with `[[telegram-directive-notification-rule]]` and `[[telegram-operational-protocol]]`.
