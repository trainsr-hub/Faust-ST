"""
Faust Plugins - Sovereign Utility Hub
Exposes top-level access to Faust's Acoustic Core and Telegram C2 systems.
"""
from pathlib import Path
import sys
import os

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SKILLS_DIR = PROJECT_ROOT / ".claude" / "skills"

# Ensure skills directory is accessible
if str(SKILLS_DIR) not in sys.path:
    sys.path.insert(0, str(SKILLS_DIR))

from faust_plugins.sound import speak, preload, shutdown, is_daemon_running


def notify(text: str, emoji: str = "🔄") -> bool:
    """Send a status notification to Telegram."""
    try:
        from telegram.scripts.notify import send_message
        import json
        config_path = SKILLS_DIR / "telegram" / "assets" / "telegram_config.json"
        if not config_path.exists():
            return False
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
        bot_token = config.get("bot_token")
        chat_id = config.get("chat_id")
        if bot_token and chat_id:
            formatted_text = f"{emoji} {text}" if emoji and not text.startswith(emoji) else text
            return send_message(bot_token, chat_id, formatted_text)
        return False
    except Exception as e:
        print(f"[Faust Plugin Error] Telegram notify failed: {e}", file=sys.stderr)
        return False


__all__ = ["speak", "notify", "preload", "shutdown", "is_daemon_running"]
