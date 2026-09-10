"""
Faust Telegram Plugin Bridge
Provides direct access to Telegram C2 functions.
"""
from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).parent.parent
SKILLS_DIR = PROJECT_ROOT / ".claude" / "skills"
if str(SKILLS_DIR) not in sys.path:
    sys.path.insert(0, str(SKILLS_DIR))

from telegram.scripts.notify import send_message, notify_task_complete, notify_task_failed

def notify(text: str, emoji: str = "🔄") -> bool:
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

__all__ = [
    "send_message",
    "notify_task_complete",
    "notify_task_failed",
    "notify",
]
