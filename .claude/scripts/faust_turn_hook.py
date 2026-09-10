#!/usr/bin/env python3
"""
Faust Turn Hook - Silent event handler for session telemetry and optional Telegram dispatch.
Talkback of user prompts and blind repetition of instructions is strictly deleted.
"""
import json
import os
import sys
from pathlib import Path

CLAUDE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = CLAUDE_DIR.parent
SKILLS_DIR = CLAUDE_DIR / "skills"
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(SKILLS_DIR))


def notify_telegram(text: str, emoji: str = "🔄"):
    """Send discreet notification to Telegram."""
    try:
        from telegram import notify
        return notify(text, emoji=emoji)
    except Exception as e:
        print(f"Error in notify: {e}", file=sys.stderr)
        return False


def main():
    """Main hook entry point (silent execution, zero speech talkback)."""
    try:
        hook_input = json.load(sys.stdin)
        event_type = hook_input.get("hook_event_name", "unknown")

        # Zero speech vocalization during input submission
        # Speech is reserved exclusively for deliberate strategic briefings from Faust
        if event_type == "UserPromptSubmit":
            pass

        elif event_type == "Stop":
            pass

    except Exception as e:
        pass
    finally:
        sys.exit(0)


if __name__ == "__main__":
    main()
