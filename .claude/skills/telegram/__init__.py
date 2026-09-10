"""
Faust Telegram C2 - Sovereign Skill Bridge
Provides direct access to Telegram C2 functions with Smart Dual-Mode:
1. Ultra-fast (<2ms) resident daemon dispatch to port 20130
2. Transparent direct Telegram Bot API fallback if daemon is offline
"""
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
CONFIG_PATH = PROJECT_ROOT / ".claude" / "faust_config.json"
FALLBACK_CONFIG_PATH = PROJECT_ROOT / "faust_config.json"
LEGACY_CONFIG_PATH = Path(__file__).resolve().parent / "assets" / "telegram_config.json"

DAEMON_HOST = os.getenv("FAUST_TELEGRAM_HOST", "127.0.0.1")
DAEMON_PORT = int(os.getenv("FAUST_TELEGRAM_PORT", "20130"))


def _load_config() -> Dict[str, Any]:
    """Load telegram configuration from environment, faust_config.json, or legacy assets."""
    cfg = {
        "enabled": True,
        "bot_token": os.getenv("TELEGRAM_BOT_TOKEN", ""),
        "chat_id": int(os.getenv("TELEGRAM_CHAT_ID", "0")) if os.getenv("TELEGRAM_CHAT_ID") else None,
        "manager_user_id": int(os.getenv("TELEGRAM_MANAGER_USER_ID", "0")) if os.getenv("TELEGRAM_MANAGER_USER_ID") else None,
        "port": DAEMON_PORT,
        "host": DAEMON_HOST,
    }

    cfg_file = CONFIG_PATH if CONFIG_PATH.exists() else (FALLBACK_CONFIG_PATH if FALLBACK_CONFIG_PATH.exists() else None)
    if cfg_file and cfg_file.exists():
        try:
            with open(cfg_file, "r", encoding="utf-8") as f:
                root_cfg = json.load(f)
                tg_cfg = root_cfg.get("telegram", {})
                for k, v in tg_cfg.items():
                    if v is not None and (cfg.get(k) is None or cfg.get(k) == "" or cfg.get(k) == 0):
                        cfg[k] = v
        except Exception:
            pass

    if (not cfg.get("bot_token") or not cfg.get("chat_id")) and LEGACY_CONFIG_PATH.exists():
        try:
            with open(LEGACY_CONFIG_PATH, "r", encoding="utf-8") as f:
                legacy_cfg = json.load(f)
                if not cfg.get("bot_token"):
                    cfg["bot_token"] = legacy_cfg.get("bot_token", "")
                if not cfg.get("chat_id"):
                    cfg["chat_id"] = legacy_cfg.get("chat_id")
                if not cfg.get("manager_user_id"):
                    cfg["manager_user_id"] = legacy_cfg.get("manager_user_id")
        except Exception:
            pass

    return cfg


def is_daemon_running() -> bool:
    """Check if the resident Telegram daemon on port 20130 is healthy."""
    try:
        url = f"http://{DAEMON_HOST}:{DAEMON_PORT}/health"
        req = urllib.request.Request(url, headers={"User-Agent": "Faust-Plugin-Client/1.0"}, method="GET")
        with urllib.request.urlopen(req, timeout=0.3) as resp:
            return resp.status == 200
    except Exception:
        return False


def get_status() -> Dict[str, Any]:
    """Retrieve runtime telemetry from the Telegram daemon or return offline config."""
    try:
        url = f"http://{DAEMON_HOST}:{DAEMON_PORT}/status"
        req = urllib.request.Request(url, headers={"User-Agent": "Faust-Plugin-Client/1.0"}, method="GET")
        with urllib.request.urlopen(req, timeout=0.5) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception:
        cfg = _load_config()
        return {
            "status": "offline",
            "port": DAEMON_PORT,
            "chat_id": cfg.get("chat_id"),
            "polling_active": False,
        }


def _send_direct(bot_token: str, chat_id: int, text: str, parse_mode: str = "HTML") -> bool:
    """Direct fallback transmission to Telegram Bot API when daemon is offline."""
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode,
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "Faust-Plugin-Client/1.0"},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except urllib.error.HTTPError as e:
        if e.code == 400 and parse_mode:
            payload.pop("parse_mode", None)
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json", "User-Agent": "Faust-Plugin-Client/1.0"},
            )
            try:
                with urllib.request.urlopen(req, timeout=10) as resp:
                    return resp.status == 200
            except Exception:
                return False
        return False
    except Exception:
        return False


def send_message(
    text: str,
    chat_id: Optional[int] = None,
    emoji: Optional[str] = None,
    parse_mode: str = "HTML",
    use_daemon: bool = True,
) -> bool:
    """
    Send a message via Telegram.
    Attempts <2ms daemon REST call first; falls back to direct Telegram API.
    """
    cfg = _load_config()
    if not cfg.get("enabled", True):
        return False

    target_chat = chat_id or cfg.get("chat_id")
    formatted_text = text.strip()
    if emoji and not formatted_text.startswith(emoji):
        formatted_text = f"{emoji} {formatted_text}"

    # 1. Primary Route: Daemon REST Call
    if use_daemon:
        try:
            url = f"http://{DAEMON_HOST}:{DAEMON_PORT}/send"
            payload = {
                "text": formatted_text,
                "chat_id": target_chat,
                "parse_mode": parse_mode,
            }
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=data,
                headers={"Content-Type": "application/json", "User-Agent": "Faust-Plugin-Client/1.0"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=1.0) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            pass  # Fall through to direct send

    # 2. Fallback Route: Direct Bot API
    bot_token = cfg.get("bot_token")
    if bot_token and target_chat:
        return _send_direct(bot_token, target_chat, formatted_text, parse_mode=parse_mode)

    return False


def notify(text: str, emoji: str = "🔄") -> bool:
    """
    Send standard milestone notification using 4-tier functional emoji protocol.
    Emojis:
      ✅ Success / Completion
      ❌ Error / Blocker
      ⚡ Startup / Alert / Risk
      🔄 In Progress / Prescript Intake
    """
    return send_message(text=text, emoji=emoji)


def notify_task_complete(task_name: str, summary: str = "") -> bool:
    """Send milestone task completion notice."""
    body = f"<b>Task Complete:</b> {task_name}"
    if summary:
        body += f"\n{summary}"
    return notify(body, emoji="✅")


def notify_task_failed(task_name: str, error: str = "") -> bool:
    """Send execution blocker / failure alert."""
    body = f"<b>Task Blocked:</b> {task_name}"
    if error:
        body += f"\n<code>{error}</code>"
    return notify(body, emoji="❌")


def pop_directive() -> Optional[Dict[str, Any]]:
    """
    Atomically pop the next pending directive from the resident Telegram daemon.
    Returns directive dict if present, None otherwise.
    """
    try:
        url = f"http://{DAEMON_HOST}:{DAEMON_PORT}/messages/pop"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Faust-Plugin-Client/1.0"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=0.5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("has_directive"):
                return data.get("directive")
    except Exception:
        pass
    return None


def pop_pending_directives(limit: int = 1) -> List[Dict[str, Any]]:
    """Pop up to `limit` pending directives from the resident Telegram daemon."""
    results = []
    for _ in range(limit):
        d = pop_directive()
        if d:
            results.append(d)
        else:
            break
    return results


def ack_directive(update_id: int, message_id: Optional[int] = None) -> bool:
    """Mark a directive as processed and advance the checkpoint."""
    try:
        url = f"http://{DAEMON_HOST}:{DAEMON_PORT}/messages/ack"
        payload = {"update_id": update_id, "message_id": message_id}
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json", "User-Agent": "Faust-Plugin-Client/1.0"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=0.5) as resp:
            return resp.status == 200
    except Exception:
        return False


__all__ = [
    "send_message",
    "notify",
    "notify_task_complete",
    "notify_task_failed",
    "pop_directive",
    "pop_pending_directives",
    "ack_directive",
    "is_daemon_running",
    "get_status",
]
