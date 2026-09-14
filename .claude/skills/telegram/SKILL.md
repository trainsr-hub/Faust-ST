# Faust Ear - Telegram Command & Control (Golden Standard)

Faust's sovereign Telegram C2 infrastructure providing pure dumb I/O gateway background services, real-time directive ingestion from the Manager's mobile Telegram Group Chat, and multi-modal status dispatches with the 4-tier functional emoji protocol.

---

## 1. Golden Standard Architectural Principles

1. **Dedicated Micro-Daemons**:
   - `.claude/skills/sound/daemon/audio_daemon.py` (Port 20129): Resident Acoustic Core TTS engine.
   - `.claude/skills/telegram/daemon/telegram_daemon.py` (Port 20130): Resident Dumb I/O Telegram C2 gateway.
   - `.claude/daemons/watchdog.py`: Autonomous process supervisor & auto-recovery.
2. **Strict Invariant: Zero LLM / Pure Dumb I/O**:
   - Daemons contain ZERO LLM logic and ZERO hardcoded heuristic responses.
   - Strictly responsible for network long-polling, FIFO directive queueing, atomic mutex locking, rate limiting, and HTTP REST transport.
3. **Single Source of Configuration**:
   - Master parameters reside in `faust_config.json` at project root.
4. **Real-Time Remote Execution**:
   - Faust listens to the Manager via the designated group chat (`-1004405650953`), executing real-time workspace actions and transmitting completion debriefings + speech.

---

## 2. Daemon REST API Specification (Port 20130)

| Endpoint | Method | Payload | Description |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | None | Fast health status, uptime, polling state, queue depth |
| `/status` | `GET` | None | Full telemetry dump (chat ID, update ID, dedup counts) |
| `/messages/pending` | `GET` | `limit: int = 10` | Non-destructive view of pending directives in queue |
| `/messages/pop` | `POST` | None | Atomically pops the oldest pending directive for Faust |
| `/messages/ack` | `POST` | `{"update_id": int}` | Commits processed update ID and advances checkpoint |
| `/send` | `POST` | `{"text": "...", "emoji": "✅"}` | Transmits message with 4-tier emoji and HTML formatting |
| `/queue/clear` | `POST` | None | Purges pending queue |

---

## 3. 4-Tier Functional Emoji Doctrine

Every transmission adheres to the single leading emoji doctrine:
- `✅` **Success**: Task completed; workspace updated; tests passed.
- `❌` **Error / Blocker**: Execution blocked or critical failure.
- `⚡` **Alert / Startup**: System online notification or strategic warning.
- `🔄` **In Progress**: Prescript received; autonomous execution underway.

---

## 4. Python Plugin Bridge (`faust_plugins.telegram`)

```python
from faust_plugins import notify, send_message, pop_directive, ack_directive, is_telegram_daemon_running

# Send milestone notification (<2ms via daemon, fallback to direct API)
notify("Implemented telemetry endpoint; all tests pass.", emoji="✅")

# Pop next directive from Manager
directive = pop_directive()
if directive:
    print(f"Received from {directive['from_name']}: {directive['text']}")
    # ... execute workspace task ...
    ack_directive(directive["update_id"])
```

---

## 5. Daemon Control Launchers

- `daemons/start_telegram_daemon.bat`: Launch Telegram dumb I/O daemon on port 20130.
- `daemons/start_audio_daemon.bat`: Launch Audio daemon on port 20129.
- `daemons/start_all_daemons.bat`: One-click launch for all Faust background daemons in hidden background processes.
- `daemons/stop_all_daemons.bat`: Cleanly terminate all running Faust daemons.
- `start_telegram_worker.bat`: Launch the event-driven Telegram worker with in-place checklist updates.

---

## 6. Event-Driven Worker & In-Place Progress Protocol (Superseding `/standby`)

The event-driven worker (`scripts/event_worker.py`) replaces the legacy `/standby` polling loop:
- **Zero Idle Token Burn**: Sits silently until a directive is pushed from Telegram.
- **In-Place Checklist Updates**: Sends a single initial card to Telegram and updates it via `editMessageText` (`[1/6] ✅ Ingress`, `[2/6] ✅ Routing`, `[3/6] ⏳ Execution...`).
- **Single In-Place Card (Zero Chat Spam)**: The in-place progress card is the sole visual indicator. Eliminates separate completion report message dumps.
- **Windowless Headless Execution**: Spawns `claude` and subprocesses with `CREATE_NO_WINDOW` (`0x08000000`) so zero console windows pop up on the Manager's screen.
- **Transactional Integrity**: Performs `/messages/ack` on completion to commit the SQLite transaction.

