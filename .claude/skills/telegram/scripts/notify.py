#!/usr/bin/env python3
"""
Telegram notification utility for Faust.
Sends a message to a configured chat via a bot token.
Configuration:
  - Set environment variables TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
  - Or create a config file `telegram_config.json` with keys:
      {"bot_token": "...", "chat_id": "..."}
Usage:
  from telegram_notify import send_telegram_message
  send_telegram_message("Task completed successfully.")
"""

import os
import json
import urllib.request
import urllib.parse

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "telegram_config.json")


def _load_config():
    """Load configuration from environment or file."""
    # Check if Telegram is globally enabled in faust_config.json
    try:
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        faust_config_path = os.path.join(project_root, "faust_config.json")
        if os.path.exists(faust_config_path):
            with open(faust_config_path, "r", encoding="utf-8") as f:
                faust_cfg = json.load(f)
                telegram_cfg = faust_cfg.get("telegram", {})
                if not telegram_cfg.get("enabled", True):  # Default to True if not specified
                    return None, None
    except Exception:
        # If we can't read the config, proceed with existing logic (fail open for safety)
        pass

    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if bot_token and chat_id:
        return bot_token, chat_id

    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                cfg = json.load(f)
                bot_token = cfg.get("bot_token")
                chat_id = cfg.get("chat_id")
                if bot_token and chat_id:
                    return bot_token, chat_id
        except Exception:
            pass

    return None, None


def send_telegram_message(text: str, emoji: str = None) -> bool:
    """
    Send a message via Telegram bot.
    Optionally prepend a single emoji to indicate message type.
    Returns True if successful, False otherwise.
    """
    bot_token, chat_id = _load_config()
    if not bot_token or not chat_id:
        print("[Telegram] Not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID "
              f"or create {CONFIG_PATH}.")
        return False

    # Prepend emoji if provided
    if emoji:
        text = f"{emoji} {text}"

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",  # optional, allows <b>, <i>, etc.
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = resp.read().decode("utf-8")
            print("[Telegram] Message sent.")
            return True
    except Exception as e:
        print(f"[Telegram] Direct send failed ({e}), queuing to outgoing folder for background dispatcher...")
        try:
            from datetime import datetime
            import time
            outgoing_dir = os.path.join(os.path.dirname(__file__), "outgoing")
            os.makedirs(outgoing_dir, exist_ok=True)
            ts = int(time.time() * 1000)
            queued_path = os.path.join(outgoing_dir, f"notify_{ts}.json")
            with open(queued_path, "w", encoding="utf-8") as f:
                json.dump({
                    "response_text": text,
                    "timestamp": datetime.now().isoformat(),
                    "source": "notify"
                }, f, ensure_ascii=False, indent=2)
            print(f"[Telegram] Queued notification to {os.path.basename(queued_path)}")
            return True
        except Exception as q_err:
            print(f"[Telegram] Failed to queue notification: {q_err}")
            return False


if __name__ == "__main__":
    # Simple CLI test
    import sys
    if len(sys.argv) > 1:
        message = " ".join(sys.argv[1:])
    else:
        message = "Test message from Faust Telegram notifier."
    success = send_telegram_message(message)
    sys.exit(0 if success else 1)