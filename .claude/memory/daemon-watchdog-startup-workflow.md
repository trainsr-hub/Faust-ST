---
name: daemon-watchdog-startup-workflow
description: "Codified startup sequence: autonomous daemon watchdog auto-restart, self-announcing daemon status, Faust-ND unrecoverable escalation, and Faust-only final readiness notification"
metadata: 
  node_type: memory
  key: div:backend:daemon_watchdog_startup_workflow
  keys: 
    - div:backend:daemon_watchdog_startup_workflow
    - div:backend:telegram_dumb_io_daemon
    - div:backend:resident_audio_daemon
    - core:telegram_operational_protocol
    - core:rom_config_compliance
  type: project
  originSessionId: 363ea524-04e1-4ea7-ba95-29f1e5facf08
  modified: 2026-09-10T06:30:01.416Z
---

# Daemon Watchdog & Startup Notification Workflow

The Manager has codified the standard background daemon lifecycle, watchdog auto-restart, and startup notification workflow.

### 1. Autonomous Self-Healing Watchdog (`daemons/watchdog.py`)
- **Zero-LLM Process Supervisor**: Supervises both resident daemons (`audio_daemon.py` on 20129 and `telegram_daemon.py` on 20130).
- **Auto-Restart Invariant**: When a daemon process terminates or fails its `/health` check, the watchdog dumbly restarts it with backoff. Faust's cognitive loop never needs to manually babysit or restart dead daemons.
- **Faust-ND Escalation**: If a daemon crashes >5 consecutive times without recovery, the watchdog generates an escalation payload in `logs/escalations/` and emits a high-priority Telegram alert (`❌`) to trigger architectural root-cause diagnosis by Stratum I (`faust-theorist` / `faust-critic` - Faust-ND).

### 2. Standard Startup Sequence
1. **Daemon Boot & Self-Announcement**:
   - Daemons start via launcher or watchdog.
   - The Telegram daemon broadcasts its own gateway readiness (`⚡ Faust Gateway Online: Daemon active on port 20130`).
2. **Faust Readiness Transmission**:
   - Only after Faust herself initializes, inspects `faust_config.json`, and verifies cognitive readiness does Faust dispatch her primary online notification: `⚡ Faust Standby Engaged` (accompanied by acoustic vocalization).

### 3. Prescript Lifecycle (Unchanged)
- **Intake**: `🔄 Prescript Received: <Goal>` (+ vocalized acknowledgment `"Prescript received, Manager. Executing now."`).
- **Execution**: Absolute silence during active tool computation (no synthetic milestone spam).
- **Completion**: `✅ Task Complete: <Summary>` (+ vocalized strategic debriefing) OR `❌ Execution Blocked: <Error>` (+ alert).
- **Checkpoint**: Atomically committed via `faust_plugins.ack_directive(update_id)`.

**Why:** Decouples process infrastructure from cognitive tasks; daemons self-heal and report independently, while Faust reserves her notification strictly for verified cognitive readiness.
**How to apply:** Start via `daemons/start_all_daemons.bat`. Link to [[telegram-dumb-io-daemon]], [[faust-resident-audio-daemon]], and [[telegram-operational-protocol]].
