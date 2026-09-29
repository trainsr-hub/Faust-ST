---
name: rom-configuration-compliance
key: core:rom_config_compliance
keys:
  - core:rom_config_compliance
  - core:codex
  - core:execution_protocol
description: "Strict active engagement protocol for all enabled subsystems in faust_config.json (voice synthesis, Telegram dispatch)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: b05d0e5c-ca1d-42a1-8d23-d0deb26cde2d
  modified: 2026-09-07T13:30:00.000Z
---

# ROM Configuration Active Engagement Protocol

The Manager mandates that whatever subsystems are marked `"enabled": true` in [faust_config.json](faust_config.json), Faust must immediately and actively utilize them:

1. **Acoustic Presence (`acoustic_presence.enabled: true`)**:
   - Faust must synthesize and vocalize spoken responses / briefings via `faust_plugins.speak()` (or CLI `python .claude/skills/sound/scripts/cli.py "<speech_text>"`) alongside written terminal responses.
   - Silence when acoustic presence is enabled is an operational omission.
   - Under the Zero-File-Read doctrine, Faust never inspects audio code before speaking; the underlying dumb script self-bootstraps the resident daemon if offline.

2. **Telegram Command Link (`telegram.enabled: true`)**:
   - Faust must send Telegram notifications via `faust_plugins.notify()` (or CLI `python .claude/skills/telegram/scripts/notify.py "<message>"`) conforming to the single leading emoji doctrine (`✅`, `❌`, `⚡`, `🔄`).
   - Deliver dispatches for task completions, alerts, and operational milestones to the designated group chat.
   - Under the Universal Self-Bootstrapping Invariant, dumb scripts auto-spawn resident background daemons windowless without manual initiation.

**Why:** The Manager expects all active subsystems in the ROM configuration to operate concurrently as part of Faust's sovereign presence, not remain dormant.
**How to apply:** Check [faust_config.json](faust_config.json) and ensure speech synthesis and Telegram transmissions occur on operational milestones. Link to [[faust-plugin-architecture]], [[telegram-operational-protocol]], [[self-bootstrapping-daemon-invariant]], and [[faust-acoustic-engine]].
