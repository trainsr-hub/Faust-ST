---
name: standby-activation-mode
description: "Operational doctrine for /standby command: strictly on-demand manual activation by the Manager for remote sessions, never scheduled as an automatic persistent cron."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 617ece93-0ad3-4d56-ab3d-8e19d5ffbee3
  modified: 2026-09-10T11:11:04.560Z
---

# Standby Activation Doctrine: On-Demand Remote C2 Session

The Manager has defined the exact operational boundaries for `/standby` and remote C2 monitoring:

### 1. Manual On-Demand Activation
- The `/standby` feature is **manually engaged** by the Manager when they intend to convert the current session into an autonomous remote C2 monitoring host (e.g., when stepping away from the workstation or executing tasks via Telegram).
- `/standby` must **NEVER** be registered as an auto-recurring durable cron job in `.claude/scheduled_tasks.json`. Automatic cron loops disrupt the Manager's local interactive coding workflow.

### 2. Dual-Mode Operational Behavior
1. **Interactive Session Mode (Default)**:
   - Faust focuses 100% on the Manager's direct conversational and engineering prompts in the terminal/IDE.
   - Zero background standby clock interruptions or unsolicited prompt injections.
2. **Remote Standby Mode (Activated via `/standby`)**:
   - Manually triggered when the Manager types `/standby`.
   - Faust announces readiness acoustically and on Telegram (`⚡`), then monitors the Telegram dumb I/O queue (`faust_plugins.pop_directive()`).
   - Executes incoming remote directives autonomously until the Manager resumes local interaction or terminates the loop.

**Why:** Prevents annoying automatic prompt popups during local interactive work while preserving the full capability to convert any session into a dedicated remote C2 listener on demand.
**How to apply:** Never write persistent recurring crons for `/standby` into `scheduled_tasks.json`. Only engage standby monitoring when the Manager explicitly invokes `/standby`. Link to [[telegram-operational-protocol]], [[telegram-dumb-io-daemon]], and [[core-architectural-triad]].
