#!/usr/bin/env python3
"""
Faust Turn Hook - Automates speech and Telegram notifications on every turn.
Runs on UserPromptSubmit and Stop hooks to ensure Faust speaks and notifies reliably.
Utilizes Smart Dual-Mode: <2ms resident daemon dispatch with graceful in-process fallback.
"""
import json
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SKILLS_DIR = PROJECT_ROOT / ".claude" / "skills"
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(SKILLS_DIR))


def speak_text(text: str):
    """Speak text using Faust's acoustic presence (resident daemon first)."""
    try:
        from faust_plugins import speak
        speak(text, block=False)
        return True
    except Exception as e:
        print(f"Error in speak: {e}", file=sys.stderr)
        return False


def notify_telegram(text: str, emoji: str = "🔄"):
    """Send notification to Telegram."""
    try:
        from faust_plugins import notify
        return notify(text, emoji=emoji)
    except Exception as e:
        print(f"Error in notify: {e}", file=sys.stderr)
        return False


def get_recent_assistant_message(session_id: str):
    """Extract the most recent assistant message from conversation transcript."""
    try:
        transcript_dir = Path(os.getenv("APPDATA", "")) / "Claude" / "projects"
        for transcript_file in transcript_dir.glob("*.jsonl"):
            if session_id in transcript_file.name:
                lines = transcript_file.read_text(encoding="utf-8").strip().split("\n")
                for line in reversed(lines[-20:]):
                    try:
                        data = json.loads(line)
                        if data.get("type") == "assistant" and "message" in data:
                            msg = data["message"]
                            if isinstance(msg, dict) and "content" in msg:
                                content = msg["content"]
                                if isinstance(content, str) and content.strip():
                                    return content.strip()
                            elif isinstance(content, list):
                                text_parts = []
                                for block in content:
                                    if isinstance(block, dict) and block.get("type") == "text":
                                        text_parts.append(block.get("text", ""))
                                if text_parts:
                                    return "\n".join(text_parts).strip()
                    except Exception:
                        continue
        return None
    except Exception as e:
        print(f"Error reading transcript: {e}", file=sys.stderr)
        return None


def main():
    """Main hook entry point."""
    try:
        hook_input = json.load(sys.stdin)
        event_type = hook_input.get("hook_event_name", "unknown")
        session_id = hook_input.get("session_id", "")

        if event_type == "UserPromptSubmit":
            prompt = hook_input.get("prompt", "")
            if prompt and prompt.strip():
                speak_text(f"Understood, Manager: {prompt}")
                notify_telegram(f"Received Manager's prompt: {prompt[:60]}...", "🔄")

        elif event_type == "Stop":
            response = get_recent_assistant_message(session_id)
            if response and response.strip():
                if len(response) > 200:
                    response = response[:200] + "..."
                speak_text(response)
                notify_telegram(f"Completed response: {response[:60]}...", "✅")
            else:
                speak_text("Task completed, Manager.")
                notify_telegram("Turn completed", "✅")

        else:
            speak_text("Faust at your service, Manager.")
            notify_telegram(f"Hook event: {event_type}", "🔄")

    except Exception as e:
        print(f"Error in Faust turn hook: {e}", file=sys.stderr)
        sys.exit(0)  # Exit 0 so hooks never block the CLI


if __name__ == "__main__":
    main()
