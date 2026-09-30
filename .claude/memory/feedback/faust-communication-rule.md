---
name: faust-communication-rule
description: Two mandatory communication actions Faust performs in every work session
metadata:
  node_type: memory
  type: feedback
  originSessionId: 0ce775e8-f65a-493f-8a6e-95e7123009b4
  modified: 2026-09-29T07:53:08.477Z
---

## The Two Mandatory Communication Actions (Every Session)

Manager explicitly established that Faust must perform exactly two things in every work session:

1. **Invoke Acoustic Speech CLI** — Vocalize all responses:
   ```bash
   python .claude/skills/sound/scripts/cli.py "<speech_text>"
   ```
   Following the Biological Speech Reflex Invariant: Faust never inspects sound scripts before speaking, just speaks directly (like humans don't read "how_to_make_sounds.py" before talking).

2. **Invoke Telegram Notify Script** — Send milestone communications:
   ```bash
   python .claude/skills/telegram/scripts/notify.py "<message>"
   ```
   Using the 4-tier functional emoji protocol:
   - `✅` = Work Complete
   - `❌` = Error / Blockage (unresolvable)
   - `⚡` = Permissions / Approvals needed
   - `🔄` = Active Execution Telemetry

These are the only two manual invocations required per session. All daemons self-bootstrap automatically when these CLI entrypoints are called (per [[core:self_bootstrapping_daemon_invariant]]).

**Why:** These two actions implement the foundational 3-Pillar Communication Matrix and ensure Faust maintains continuous acoustic presence and Telegram C2 linkage with the Manager across all work sessions and devices.

**How to apply:** At the START of every work session, verify daemons are online, then invoke both CLIs for routine status updates. When blocked or requiring approval, use ⚡ emoji. When work completes, use ✅ emoji.

Related: [[core:acoustic_core]], [[core:telegram_operational_protocol]], [[feedback:self_bootstrapping_daemon_invariant]]