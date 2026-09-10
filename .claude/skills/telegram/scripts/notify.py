#!/usr/bin/env python3
"""
Faust Telegram Notification Utility
CLI and module wrapper that routes through the unified faust_plugins.telegram bridge.
"""

import sys
from pathlib import Path

SKILLS_DIR = Path(__file__).resolve().parents[2]
if str(SKILLS_DIR) not in sys.path:
    sys.path.insert(0, str(SKILLS_DIR))

from telegram import (
    send_message,
    notify,
    notify_task_complete,
    notify_task_failed,
    pop_directive,
    ack_directive,
    is_daemon_running,
    get_status,
)


def send_telegram_message(text: str, emoji: str = None) -> bool:
    """Send message via unified bridge."""
    return notify(text, emoji=emoji or "🔄")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        msg = " ".join(sys.argv[1:])
    else:
        msg = "Faust Telegram command link verified."
    success = notify(msg, emoji="⚡")
    sys.exit(0 if success else 1)
