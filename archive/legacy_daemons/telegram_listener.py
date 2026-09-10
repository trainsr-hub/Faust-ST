#!/usr/bin/env python3
"""
Telegram listener for Faust.
Polls for new messages and replies to any message in the configured chat.
"""

import json
import os
import time
import urllib.request
import urllib.parse

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "telegram_config.json")


def load_config():
    """Load bot token and chat ID from config file."""
    if not os.path.exists(CONFIG_PATH):
        raise FileNotFoundError(f"Config file not found: {CONFIG_PATH}")
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        cfg = json.load(f)
    bot_token = cfg.get("bot_token")
    chat_id = cfg.get("chat_id")
    if not bot_token or chat_id is None:
        raise ValueError("Missing bot_token or chat_id in config")
    return bot_token, chat_id


def send_message(bot_token, chat_id, text):
    """Send a message via Telegram bot."""
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = resp.read().decode("utf-8")
            # Optionally check response
            return True
    except Exception as e:
        print(f"[Telegram Listener] Failed to send message: {e}")
        return False


def get_updates(bot_token, offset=None, timeout=30):
    """Get updates from Telegram."""
    url = f"https://api.telegram.org/bot{bot_token}/getUpdates"
    params = {"timeout": timeout}
    if offset is not None:
        params["offset"] = offset
    query_string = urllib.parse.urlencode(params)
    full_url = f"{url}?{query_string}"
    try:
        with urllib.request.urlopen(full_url, timeout=timeout + 5) as resp:
            resp_data = resp.read().decode("utf-8")
            return json.loads(resp_data)
    except Exception as e:
        print(f"[Telegram Listener] Error getting updates: {e}")
        return {"ok": False, "result": []}


def main():
    print("[Telegram Listener] Starting Faust Telegram listener...")
    try:
        bot_token, chat_id = load_config()
        print(f"[Telegram Listener] Loaded config. Chat ID: {chat_id}")
    except Exception as e:
        print(f"[Telegram Listener] Failed to load config: {e}")
        return

    offset = None
    print("[Telegram Listener] Entering polling loop...")
    while True:
        try:
            result = get_updates(bot_token, offset=offset, timeout=30)
            if not result.get("ok"):
                print(f"[Telegram Listener] getUpdates not ok: {result}")
                time.sleep(5)
                continue

            updates = result.get("result", [])
            for update in updates:
                offset = update["update_id"] + 1
                message = update.get("message")
                if not message:
                    continue
                # We could filter by chat_id if needed, but we assume the bot is only in this group/chat
                text = message.get("text", "")
                from_user = message.get("from", {})
                first_name = from_user.get("first_name", "Someone")
                print(f"[Telegram Listener] Received message from {first_name}: {text}")

                # Prepare a response
                response = f"Faust: Message received from {first_name}. How can I assist you, Manager?"
                # Optionally, you could echo or process commands here.
                send_message(bot_token, chat_id, response)

            # If no updates, just continue looping (long timeout in getUpdates handles waiting)
        except KeyboardInterrupt:
            print("[Telegram Listener] Stopped by user.")
            break
        except Exception as e:
            print(f"[Telegram Listener] Unexpected error: {e}")
            time.sleep(5)


if __name__ == "__main__":
    main()