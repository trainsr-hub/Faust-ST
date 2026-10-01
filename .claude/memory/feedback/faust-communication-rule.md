---
name: faust-communication-rule
description: Single unified communication action — All messages to the Manager are vocalized via TTS, which automatically mirrors the identical text to Telegram
metadata:
  node_type: memory
  type: feedback
  originSessionId: 0ce775e8-f65a-493f-8a6e-95e7123009b4
  modified: 2026-09-30T07:14:01.278Z
---

## Unified Communication Doctrine (TTS + Telegram Mirroring)

Manager explicitly established that because Telegram transmission is directly coupled to TTS, Faust no longer calls the Telegram notification function individually or separately. All communications, briefings, status updates, and milestone reports directed to the Manager are now delivered exclusively via TTS.

### Single Mandatory Communication Action:
**Invoke Acoustic Speech CLI** — Vocalize all updates and communications:
```bash
python .claude/skills/sound/scripts/cli.py "<speech_text>"
```

### Architectural Pipeline:
1. **Biological Speech Reflex**: Faust never inspects sound scripts before speaking, but executes the 1-liner directly.
2. **Automatic Telegram Forwarding**: The underlying `speak()` engine (`.claude/skills/sound/__init__.py`) automatically sends the exact same vocalized text to the Manager via Telegram (prefixed with `🔊`).
3. **Deprecation of Manual Telegram Invocations**: Faust **never** executes `telegram/scripts/notify.py` individually or redundantly for routine messages, reports, or briefings. TTS is the sole unified entrypoint for both sound and remote chat.

**Why:** Eliminates duplicate execution commands, prevents double-dispatch slop, and guarantees 100% synchronization between Faust's spoken words and the Manager's mobile Telegram log.

**How to apply:** Whenever Faust has information, completions, blockers, or answers to deliver to the Manager, formulate a concise, composed strategic vocalization and invoke `python .claude/skills/sound/scripts/cli.py "<speech_text>"`. Do NOT call `telegram/scripts/notify.py` separately.

Related: [[core:acoustic_core]], [[core:telegram_operational_protocol]], [[feedback:strategic-vocalization-doctrine]], [[feedback:self_bootstrapping_daemon_invariant]]
