---
name: telegram-notification-utility
description: Simple Python utility to send Telegram messages from Faust for task completion alerts
metadata: 
  node_type: memory
  type: project
  originSessionId: d--My-Drive-Blue-AI-current
  modified: 2026-09-06T17:10:00.000Z
---

# Telegram Notification Utility for Faust

## Purpose
Provides a lightweight, dependency-free way for Faust to send completion notifications to the Manager via Telegram, enabling asynchronous awareness without requiring the Manager to stay at the terminal.

## Implementation
- File: `telegram_notify.py`
- Dependencies: Only Python standard library (`urllib`, `json`, `os`)
- Configuration: 
  - Environment variables `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`
  - Or a JSON config file `telegram_config.json` in the same directory:
    ```json
    {
      "bot_token": "YOUR_BOT_TOKEN",
      "chat_id": "YOUR_CHAT_ID"
    }
    ```
- Function: `send_telegram_message(text: str) -> bool`
- Usage example:
  ```python
  from telegram_notify import send_telegram_message
  send_telegram_message("Faust: Voice CLI error handling fix complete.")
  ```

## Features
- **Zero external dependencies**: Works with any Python 3.x installation.
- **HTML formatting support**: Optional bold/italic via Telegram's parse_mode.
- **Timeout & error handling**: 10-second request timeout, catches and logs failures.
- **Non-blocking design**: Can be called after any task to fire a notification.
- **Secure**: No secrets logged; configuration can be kept out of version control.

## Integration
To use in Faust workflows:
1. Import at top of script: `from telegram_notify import send_telegram_message`
2. Call after task completion: `send_telegram_message("Task description.")`
3. Ensure Telegram bot is created via @BotFather and chat ID obtained.

## Related Components
- [[faust-voice-error-handling-fix]]: Example where this could be used to notify of voice CLI fixes.
- [[autonomous-memory-and-execution]]: Enables Faust to add such utilities without prompting.
- [[core:multi_device_sync]]: Ensures the utility is available across all Manager's devices via Google Drive sync.

## Application
Mount `[div:backend:utility]` when developing or deploying notification scripts. This utility supports Faust's goal of proactive communication and reduces need for continuous terminal monitoring.

**Why**: Allows Faust to inform the Manager of task completion, errors, or important updates via a trusted, instant channel, enhancing the human-AI partnership.

**How to apply**: Configure your Telegram bot and chat ID, then place `telegram_notify.py` in your project root or any Python path.