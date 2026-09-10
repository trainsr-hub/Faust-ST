# Faust Ear - Telegram Command & Control

Faust's unified Telegram integration system providing secure command reception, intelligent processing via Faust's cognitive architecture, and status reporting with 4-tier emoji protocol.

## Overview

The Faust Ear daemon provides:
- Single-instance mutex lock preventing multiple polling conflicts (HTTP 409 Resolution)
- Atomic update deduplication with sliding window persistence
- Webhook clearing to ensure clean getUpdates polling
- Rate-limit exponential backoff handling (HTTP 429)
- Thread-safe message queuing for brain processing
- Vision stream logging for real-time cognitive integration
- Outgoing watcher thread for dispatching Faust's responses
- Persistent processed ID tracking for crash recovery
- 4-tier functional emoji protocol (`✅`, `❌`, `⚡`, `🔄`)

## Architecture

```
Telegram Bot API → [Faust Ear Daemon] → [Faust Cognitive Brain] → [Faust Ear Dispatcher] → Telegram
                         │                           │
                   Message Queue              Vision Stream Log
                         │                           │
                Worker Thread                  Outgoing Watcher
```

The Faust Ear operates as a dedicated background process that:
1. Long-polls Telegram Bot API `getUpdates` socket exclusively
2. Writes sanitized directives to local event log (`telegram_incoming.jsonl`)
3. Saves structured messages as JSON files for Faust's brain processing
4. Maintains vision stream log for real-time cognitive ingestion
5. Watches outgoing directory for Faust's responses to dispatch
6. All Faust instances passively consume from local event streams

## Installation

This skill is self-contained within `.claude/skills/telegram/` and requires:
- Telegram Bot Token and Chat ID configured in `assets/telegram_config.json`
- Python 3.7+ with standard library dependencies

### Configuration (`assets/telegram_config.json`)
```json5
{
  "bot_token": "YOUR_TELEGRAM_BOT_TOKEN",
  "chat_id": -1004405650953,
  "manager_user_id": 8016442589
}
```

## Commands

### Daemon Control

| Command | Description |
|---------|-------------|
| `faust-ear-start` | Start the Telegram Smart Listener daemon in background |
| `faust-ear-stop` | Stop the running Faust Ear daemon |
| `faust-ear-status` | Check daemon status and last processed update |
| `faust-ear-logs` | View recent listener activity |

### Scripts

All scripts are located in `.claude/skills/telegram/scripts/` and can be invoked via Python or batch:

- `python .claude/skills/telegram/scripts/listener.py` - Core daemon (runs indefinitely)
- `python .claude/skills/telegram/scripts/notify.py` - Direct notification utility
- `.claude/skills/telegram/scripts/start_ear.bat` - Windows batch launcher (hidden console)
- `python .claude/skills/telegram/scripts/listener.py --test` - Test configuration

## Usage Examples

### Start Faust Ear Daemon
```bash
# Windows (recommended - hidden console)
.\.claude\skills\telegram\scripts\start_ear.bat

# Direct Python (shows console)
python .claude/skills/telegram/scripts/listener.py
```

### Send Telegram Notification
```bash
python .claude/skills/telegram/scripts/notify.py "Understanding confirmed; proceed to dispatch."
```

### Check Daemon Status
```bash
# Check if lock file exists and process is running
tasklist /FI "IMAGENAME eq pythonw.exe" | findstr listener
type .claude\skills\telegram\scripts\telegram_smart_listener.lock
```

## Configuration

Telegram settings are managed through `assets/telegram_config.json`:

```json5
{
  "bot_token": "123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ",
  "chat_id": -1004405650953,
  "manager_user_id": 8016442589
}
```

Faust configuration integration (via `faust_config.json`):
```json5
{
  "telegram": {
    "enabled": true,
    "bot_token": "123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ",
    "chat_id": -1004405650953,
    "manager_user_id": 8016442589
  }
}
```

## 4-Tier Functional Emoji Protocol

Faust uses standardized emojis for immediate visual feedback:

| Emoji | Meaning | Usage Context |
|-------|---------|---------------|
| ✅ | Success / Confirmation | Task completed successfully |
| ❌ | Error / Failure | Operation failed or rejected |
| ⚡ | Active / Processing | System online, command received |
| 🔄 | Pending / In Progress | Vision received, processing |

## Integration with Faust Systems

This skill integrates with Faust's turn hook system (`scripts/faust_turn_hook.py`) to provide:
- Automatic Telegram milestone notifications on `UserPromptSubmit` and `Stop` events
- Vision stream logging for real-time cognitive integration
- Persistent configuration management via ROM system
- Single-instance daemon architecture preventing polling conflicts

## Troubleshooting

### HTTP 409 Conflict Errors
- **Cause**: Multiple instances attempting to poll Telegram getUpdates simultaneously
- **Solution**: Faust Ear uses single-instance mutex lock - ensure only one daemon runs
- **Verification**: Check `telegram_smart_listener.lock` contains current PID

### No Message Reception
- **Cause**: Webhook blocking getUpdates or incorrect chat_id filtering
- **Solution**: Faust Ear automatically calls `deleteWebhook()` on startup
- **Verification**: Check listener.log for "Webhook cleared successfully"

### Stale Lockfile Recovery
- **Cause**: Previous daemon crashed without cleaning lock file
- **Solution**: Faust Ear automatically detects stale PID and cleans lock
- **Verification**: Listener log shows "[Lock] Stale lockfile detected for dead PID"

## References

- [Telegram Operational Protocol](../references/telegram-operational-protocol.md) - Detailed command flow
- [Telegram Setup Status](../references/telegram-setup-status.md) - Configuration verification
- [Telegram Listener Fix](../references/telegram-listener-fix.md) - HTTP 409 resolution details