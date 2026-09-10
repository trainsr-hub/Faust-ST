#!/usr/bin/env python3
"""
Faust Telegram Dumb I/O Daemon (Tier 1 Gateway Service)
Pure deterministic I/O relay for Telegram Bot API group chat communications.

Enforces Golden Standard Invariants:
  1. ZERO LLM / ZERO DIY heuristic brain logic - strictly dumb transport, queueing, and network I/O.
  2. Single-instance mutex lock preventing HTTP 409 Conflict polling races.
  3. Webhook clearing upon startup to ensure clean getUpdates long-polling.
  4. Sliding-window deduplication (in-memory + atomic disk persistence).
  5. FIFO directive queue exposed via local REST API on port 20130 (<2ms IPC).
  6. Egress message transmitter with 4-tier functional emoji doctrine and rate-limit backoff.
"""

import os
import sys
import json
import time
import queue
import random
import logging
import threading
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime
from pathlib import Path
from collections import deque
from typing import Any, Dict, List, Optional
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Project paths
BASE_DIR = Path(__file__).resolve().parent
TELEGRAM_DIR = BASE_DIR.parent
SKILLS_DIR = TELEGRAM_DIR.parent
CLAUDE_DIR = SKILLS_DIR.parent
PROJECT_ROOT = CLAUDE_DIR.parent

LOGS_DIR = TELEGRAM_DIR / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)

CONFIG_PATH = CLAUDE_DIR / "faust_config.json"
FALLBACK_CONFIG_PATH = PROJECT_ROOT / "faust_config.json"
LEGACY_CONFIG_PATH = TELEGRAM_DIR / "assets" / "telegram_config.json"

LOCK_FILE = BASE_DIR / "telegram_daemon.lock"
LOG_FILE = LOGS_DIR / "telegram_daemon.log"
INCOMING_JSONL = LOGS_DIR / "telegram_incoming.jsonl"
OUTGOING_JSONL = LOGS_DIR / "telegram_outgoing.jsonl"
PROCESSED_FILE = BASE_DIR / "processed_update_id.txt"
DEDUPLICATION_FILE = BASE_DIR / "processed_ids.json"
ACTIVE_DIRECTIVE_FILE = BASE_DIR / "active_directive.json"

# Ensure stream handles exist under pythonw
if sys.stdout is None:
    sys.stdout = open(LOG_FILE, "a", encoding="utf-8")
if sys.stderr is None:
    sys.stderr = open(LOG_FILE, "a", encoding="utf-8")

# Configure daemon logger with both console and file handler
logger = logging.getLogger("faust.telegram_daemon")
logger.setLevel(logging.INFO)
formatter = logging.Formatter("[%(asctime)s] [faust.telegram_daemon] %(levelname)s: %(message)s", datefmt="%H:%M:%S")

file_handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

if sys.stdout and hasattr(sys.stdout, "write"):
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)



# --- Configuration Resolver ---

def load_telegram_config() -> Dict[str, Any]:
    """Load Telegram configuration following priority cascade: ENV -> faust_config.json -> legacy assets."""
    cfg = {
        "enabled": True,
        "bot_token": os.getenv("TELEGRAM_BOT_TOKEN", ""),
        "chat_id": int(os.getenv("TELEGRAM_CHAT_ID", "0")) if os.getenv("TELEGRAM_CHAT_ID") else None,
        "manager_user_id": int(os.getenv("TELEGRAM_MANAGER_USER_ID", "0")) if os.getenv("TELEGRAM_MANAGER_USER_ID") else None,
        "port": int(os.getenv("FAUST_TELEGRAM_PORT", "20130")),
        "host": os.getenv("FAUST_TELEGRAM_HOST", "127.0.0.1"),
        "poll_timeout": 30,
        "max_dedup_history": 1000,
    }

    # 1. Master ROM Config
    cfg_file = CONFIG_PATH if CONFIG_PATH.exists() else (FALLBACK_CONFIG_PATH if FALLBACK_CONFIG_PATH.exists() else None)
    if cfg_file and cfg_file.exists():
        try:
            with open(cfg_file, "r", encoding="utf-8") as f:
                root_cfg = json.load(f)
                tg_cfg = root_cfg.get("telegram", {})
                for k, v in tg_cfg.items():
                    if v is not None and (cfg.get(k) is None or cfg.get(k) == "" or cfg.get(k) == 0):
                        cfg[k] = v
        except Exception as e:
            logger.warning(f"Could not load faust_config.json: {e}")

    # 2. Legacy fallback
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
        except Exception as e:
            logger.warning(f"Could not load legacy telegram_config.json: {e}")

    return cfg


# --- Process Mutex Locking ---

def is_pid_running(pid: int) -> bool:
    """Verify if a process ID is actively executing on the OS."""
    if pid <= 0:
        return False
    if sys.platform == "win32":
        import ctypes
        PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
        SYNCHRONIZE = 0x00100000
        handle = ctypes.windll.kernel32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION | SYNCHRONIZE, False, pid)
        if handle:
            ctypes.windll.kernel32.CloseHandle(handle)
            return True
        return False
    else:
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False


def acquire_mutex_lock() -> bool:
    """Acquire single-instance mutex lock. Fails fast if another live instance holds it."""
    current_pid = os.getpid()
    for _ in range(3):
        try:
            with open(LOCK_FILE, "x", encoding="utf-8") as f:
                f.write(str(current_pid))
            logger.info(f"Acquired single-instance mutex lock (PID {current_pid}).")
            return True
        except FileExistsError:
            try:
                with open(LOCK_FILE, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                pid = int(content) if content else 0
                if pid == current_pid:
                    return True
                if is_pid_running(pid):
                    logger.error(f"Active telegram_daemon instance already running with PID {pid}. Aborting.")
                    return False
                else:
                    logger.warning(f"Stale lockfile detected for dead PID {pid}. Purging.")
                    try:
                        os.remove(LOCK_FILE)
                    except OSError:
                        pass
                    time.sleep(0.2)
                    continue
            except Exception:
                try:
                    os.remove(LOCK_FILE)
                except OSError:
                    pass
                time.sleep(0.2)
                continue
    return False


def release_mutex_lock():
    """Release single-instance mutex lock if owned by current PID."""
    if LOCK_FILE.exists():
        try:
            with open(LOCK_FILE, "r", encoding="utf-8") as f:
                content = f.read().strip()
            if content and int(content) == os.getpid():
                os.remove(LOCK_FILE)
                logger.info("Released single-instance mutex lock.")
        except Exception:
            pass


# --- Deduplication & Persistence ---

class DedupManager:
    """Manages update_id and message_id deduplication with sliding window memory and disk backup."""

    def __init__(self, max_history: int = 1000):
        self.max_history = max_history
        self.processed_update_ids = deque(maxlen=max_history)
        self.processed_message_ids = deque(maxlen=max_history)
        self.lock = threading.Lock()
        self._load_disk_state()

    def _load_disk_state(self):
        with self.lock:
            if DEDUPLICATION_FILE.exists():
                try:
                    with open(DEDUPLICATION_FILE, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    self.processed_update_ids = deque(data.get("update_ids", [])[-self.max_history:], maxlen=self.max_history)
                    self.processed_message_ids = deque(data.get("message_ids", [])[-self.max_history:], maxlen=self.max_history)
                except Exception as e:
                    logger.warning(f"Failed to load deduplication file: {e}")

    def save_disk_state(self):
        with self.lock:
            try:
                data = {
                    "update_ids": list(self.processed_update_ids),
                    "message_ids": list(self.processed_message_ids),
                }
                tmp_file = BASE_DIR / f"{DEDUPLICATION_FILE.name}.tmp"
                with open(tmp_file, "w", encoding="utf-8") as f:
                    json.dump(data, f)
                if DEDUPLICATION_FILE.exists():
                    os.replace(tmp_file, DEDUPLICATION_FILE)
                else:
                    os.rename(tmp_file, DEDUPLICATION_FILE)
            except Exception as e:
                logger.error(f"Failed to persist deduplication state: {e}")

    def is_duplicate_update(self, update_id: int) -> bool:
        with self.lock:
            if update_id in self.processed_update_ids:
                return True
            self.processed_update_ids.append(update_id)
            return False

    def is_duplicate_message(self, message_id: Optional[int]) -> bool:
        if message_id is None:
            return False
        with self.lock:
            if message_id in self.processed_message_ids:
                return True
            self.processed_message_ids.append(message_id)
            return False


# --- Ingress Poller Worker ---

class TelegramPollerWorker:
    """
    Pure dumb I/O ingress poller.
    Long-polls Telegram Bot API, validates group/origin, deduplicates, and enqueues directives.
    """

    def __init__(self, config: Dict[str, Any], dedup: DedupManager, directive_queue: queue.Queue):
        self.config = config
        self.dedup = dedup
        self.directive_queue = directive_queue
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self.last_update_id = self._load_last_processed()
        self.last_poll_time = 0.0
        self.polling_active = False

    def _load_last_processed(self) -> int:
        if PROCESSED_FILE.exists():
            try:
                with open(PROCESSED_FILE, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                return int(content) if content else 0
            except Exception:
                pass
        return 0

    def commit_last_processed(self, update_id: int):
        try:
            self.last_update_id = max(self.last_update_id, update_id)
            tmp_file = BASE_DIR / f"{PROCESSED_FILE.name}.tmp"
            with open(tmp_file, "w", encoding="utf-8") as f:
                f.write(str(self.last_update_id))
            if PROCESSED_FILE.exists():
                os.replace(tmp_file, PROCESSED_FILE)
            else:
                os.rename(tmp_file, PROCESSED_FILE)
        except Exception as e:
            logger.error(f"Failed to save processed update_id {update_id}: {e}")

    def delete_webhook(self) -> bool:
        token = self.config.get("bot_token")
        if not token:
            return False
        url = f"https://api.telegram.org/bot{token}/deleteWebhook"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Faust-Telegram-Daemon/1.0"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if data.get("ok"):
                    logger.info("Cleared Telegram webhook successfully.")
                    return True
        except Exception as e:
            logger.warning(f"Error clearing webhook: {e}")
        return False

    def start(self):
        if self._running:
            return
        self._running = True
        self.delete_webhook()
        self._thread = threading.Thread(target=self._poll_loop, name="FaustTelegramPoller", daemon=True)
        self._thread.start()
        logger.info("Telegram Poller Worker thread started.")

    def stop(self):
        self._running = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2.0)
        self.dedup.save_disk_state()
        logger.info("Telegram Poller Worker thread stopped.")

    def _should_accept(self, message: dict) -> bool:
        expected_chat_id = self.config.get("chat_id")
        from_user = message.get("from", {})
        if from_user.get("is_bot", False):
            return False

        chat = message.get("chat", {})
        chat_type = chat.get("type")
        chat_id = chat.get("id")

        if expected_chat_id and chat_id != expected_chat_id:
            return False

        return chat_type in ["group", "supergroup", "private"]

    def _record_to_jsonl(self, update_id: int, message: dict):
        LOGS_DIR.mkdir(parents=True, exist_ok=True)
        from_user = message.get("from", {})
        entry = {
            "timestamp": datetime.now().isoformat(),
            "update_id": update_id,
            "message_id": message.get("message_id"),
            "chat_id": message.get("chat", {}).get("id"),
            "from_id": from_user.get("id"),
            "from_name": from_user.get("first_name", "") + (" " + from_user.get("last_name", "") if from_user.get("last_name") else ""),
            "username": from_user.get("username", ""),
            "text": message.get("text", ""),
        }
        try:
            with open(INCOMING_JSONL, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry, ensure_ascii=False) + "\n")
                f.flush()
        except Exception as e:
            logger.error(f"Failed to record incoming message to JSONL: {e}")

    def _poll_loop(self):
        token = self.config.get("bot_token")
        timeout = self.config.get("poll_timeout", 30)
        backoff = 2.0
        max_backoff = 60.0

        while self._running:
            self.last_poll_time = time.time()
            self.polling_active = True
            url = f"https://api.telegram.org/bot{token}/getUpdates"
            params = {"timeout": timeout}
            if self.last_update_id > 0:
                params["offset"] = self.last_update_id + 1

            query_str = urllib.parse.urlencode(params)
            full_url = f"{url}?{query_str}"

            try:
                req = urllib.request.Request(full_url, headers={"User-Agent": "Faust-Telegram-Daemon/1.0"})
                with urllib.request.urlopen(req, timeout=timeout + 10) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))

                if not resp_data.get("ok"):
                    desc = resp_data.get("description", "")
                    logger.warning(f"getUpdates returned non-ok: {desc}")
                    time.sleep(3.0)
                    continue

                backoff = 2.0
                updates = resp_data.get("result", [])

                for update in updates:
                    update_id = update.get("update_id")
                    if update_id is None:
                        continue

                    if update_id > self.last_update_id:
                        self.commit_last_processed(update_id)

                    message = update.get("message") or update.get("channel_post")
                    if not message:
                        continue

                    if not self._should_accept(message):
                        continue

                    if self.dedup.is_duplicate_update(update_id):
                        continue

                    msg_id = message.get("message_id")
                    if self.dedup.is_duplicate_message(msg_id):
                        continue

                    text = message.get("text", "").strip()
                    from_user = message.get("from", {})
                    from_id = from_user.get("id")
                    from_name = from_user.get("first_name", "") + (" " + from_user.get("last_name", "") if from_user.get("last_name") else "")
                    manager_id = self.config.get("manager_user_id")

                    self._record_to_jsonl(update_id, message)

                    # Deterministic Directive Refiner
                    is_manager = (from_id == manager_id) if manager_id else True
                    is_interrupt = text.lower().startswith(("/stop", "/abort", "/override", "/cancel", "stop", "abort"))
                    command_type = "interrupt" if is_interrupt else ("command" if text.startswith("/") else "directive")

                    directive = {
                        "update_id": update_id,
                        "message_id": msg_id,
                        "chat_id": message.get("chat", {}).get("id"),
                        "from_id": from_id,
                        "from_name": from_name.strip(),
                        "username": from_user.get("username", ""),
                        "is_manager": is_manager,
                        "is_interrupt": is_interrupt,
                        "command_type": command_type,
                        "text": text,
                        "received_at": datetime.now().isoformat(),
                        "status": "pending",
                    }
                    self.directive_queue.put(directive)
                    logger.info(f"Refined {command_type.upper()} from {from_name.strip()} (update_id={update_id}): {text[:60]}")

                    # Persist active directive snapshot for 0ms consumer reads
                    try:
                        with open(ACTIVE_DIRECTIVE_FILE, "w", encoding="utf-8") as f:
                            json.dump(directive, f, indent=2)
                    except Exception as e:
                        logger.error(f"Failed to write active directive snapshot: {e}")

                    if update_id % 10 == 0:
                        self.dedup.save_disk_state()

            except urllib.error.HTTPError as http_err:
                self.polling_active = False
                if http_err.code == 409:
                    logger.warning(f"HTTP 409 Conflict. Backing off {backoff:.1f}s...")
                    time.sleep(backoff)
                    backoff = min(backoff * 2, max_backoff)
                elif http_err.code == 429:
                    retry_after = 5
                    try:
                        ra = http_err.headers.get("Retry-After")
                        if ra and ra.isdigit():
                            retry_after = int(ra)
                    except Exception:
                        pass
                    logger.warning(f"HTTP 429 Rate Limited. Sleeping {retry_after}s...")
                    time.sleep(retry_after)
                else:
                    logger.error(f"HTTP error {http_err.code} on getUpdates: {http_err}")
                    time.sleep(3.0)
            except Exception as e:
                self.polling_active = False
                logger.error(f"Exception during getUpdates loop: {e}")
                time.sleep(3.0)


# --- Egress Message Dispatcher ---

def send_telegram_raw(bot_token: str, chat_id: int, text: str, parse_mode: str = "HTML") -> bool:
    """Send message via Telegram Bot API with HTML fallback, retries, and rate limit handling."""
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
        headers={"Content-Type": "application/json", "User-Agent": "Faust-Telegram-Daemon/1.0"},
    )

    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                # Log outgoing transmission
                LOGS_DIR.mkdir(parents=True, exist_ok=True)
                with open(OUTGOING_JSONL, "a", encoding="utf-8") as f:
                    f.write(json.dumps({
                        "timestamp": datetime.now().isoformat(),
                        "chat_id": chat_id,
                        "text": text,
                        "status": "sent",
                    }, ensure_ascii=False) + "\n")
                return True
        except urllib.error.HTTPError as e:
            if e.code == 400 and parse_mode:
                # Retry without parse_mode if HTML syntax error
                payload.pop("parse_mode", None)
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json", "User-Agent": "Faust-Telegram-Daemon/1.0"},
                )
                try:
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        return True
                except Exception as inner_e:
                    logger.error(f"Fallback plain-text send failed: {inner_e}")
                    return False
            elif e.code == 429:
                wait_sec = 2.0 * (attempt + 1)
                time.sleep(wait_sec)
                continue
            else:
                logger.error(f"HTTP error on sendMessage ({e.code}): {e}")
                return False
        except Exception as e:
            logger.error(f"Network error on sendMessage: {e}")
            if attempt < 2:
                time.sleep(1.0 * (attempt + 1))
                continue
            return False
    return False


# --- FastAPI Application & Schemas ---

class SendMessageRequest(BaseModel):
    text: str = Field(..., description="Message text to transmit")
    emoji: Optional[str] = Field(default=None, description="Optional leading functional emoji (✅, ❌, ⚡, 🔄)")
    chat_id: Optional[int] = Field(default=None, description="Target chat ID (defaults to configured group chat)")
    parse_mode: str = Field(default="HTML", description="Telegram parse mode ('HTML' or 'Markdown')")


class AckDirectiveRequest(BaseModel):
    update_id: int = Field(..., description="Update ID to acknowledge")
    message_id: Optional[int] = Field(default=None, description="Optional Message ID")


# Global server state
config_state: Dict[str, Any] = {}
dedup_manager: Optional[DedupManager] = None
directive_queue: queue.Queue = queue.Queue()
poller_worker: Optional[TelegramPollerWorker] = None
start_time = time.time()


@asynccontextmanager
async def lifespan(app_instance: FastAPI):
    global config_state, dedup_manager, poller_worker
    logger.info("Initializing Faust Telegram Dumb I/O Daemon...")

    if not acquire_mutex_lock():
        logger.error("Could not acquire mutex lock. Terminating startup.")
        sys.exit(1)

    config_state = load_telegram_config()
    dedup_manager = DedupManager(max_history=config_state.get("max_dedup_history", 1000))

    if config_state.get("enabled", True) and config_state.get("bot_token"):
        poller_worker = TelegramPollerWorker(config_state, dedup_manager, directive_queue)
        poller_worker.start()
        # Deterministic one-time gateway boot broadcast
        token = config_state.get("bot_token")
        chat_id = config_state.get("chat_id")
        if token and chat_id:
            try:
                send_telegram_raw(token, chat_id, "⚡ <b>Faust Gateway Online:</b> Daemon active on port 20130 (Dumb I/O).")
            except Exception as e:
                logger.warning(f"Could not dispatch gateway startup notification: {e}")
        logger.info(f"Faust Telegram Daemon ONLINE on http://127.0.0.1:{config_state.get('port', 20130)}")
    else:
        logger.warning("Telegram daemon started in PASSIVE mode (disabled or missing token).")

    yield

    logger.info("Shutting down Faust Telegram Daemon...")
    if poller_worker:
        poller_worker.stop()
    if dedup_manager:
        dedup_manager.save_disk_state()
    release_mutex_lock()
    logger.info("Faust Telegram Daemon shutdown clean.")


app = FastAPI(
    title="Faust Telegram Dumb I/O Daemon",
    description="Deterministic pure dumb I/O gateway for Telegram Bot API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "faust-telegram-daemon",
        "uptime_seconds": round(time.time() - start_time, 1),
        "polling_active": poller_worker.polling_active if poller_worker else False,
        "pending_directives": directive_queue.qsize(),
        "chat_id": config_state.get("chat_id"),
        "last_update_id": poller_worker.last_update_id if poller_worker else 0,
    }


@app.get("/status")
def get_status():
    return {
        "status": "running",
        "port": config_state.get("port", 20130),
        "chat_id": config_state.get("chat_id"),
        "manager_user_id": config_state.get("manager_user_id"),
        "pending_directives": directive_queue.qsize(),
        "last_update_id": poller_worker.last_update_id if poller_worker else 0,
        "polling_active": poller_worker.polling_active if poller_worker else False,
        "dedup_history_count": len(dedup_manager.processed_update_ids) if dedup_manager else 0,
        "uptime_seconds": round(time.time() - start_time, 1),
    }


@app.get("/messages/pending")
def list_pending_directives(limit: int = 10):
    """Inspect pending directives without removing them from queue."""
    items = list(directive_queue.queue)[:limit]
    return {
        "count": len(items),
        "total_queued": directive_queue.qsize(),
        "directives": items,
    }


@app.post("/messages/pop")
def pop_directive():
    """Atomically dequeue the oldest pending directive for Faust processing."""
    try:
        item = directive_queue.get_nowait()
        directive_queue.task_done()
        return {
            "status": "ok",
            "has_directive": True,
            "directive": item,
            "remaining_queued": directive_queue.qsize(),
        }
    except queue.Empty:
        return {
            "status": "ok",
            "has_directive": False,
            "directive": None,
            "remaining_queued": 0,
        }


@app.post("/messages/ack")
def acknowledge_directive(req: AckDirectiveRequest):
    """Acknowledge completion of directive processing and advance checkpoint."""
    if poller_worker:
        poller_worker.commit_last_processed(req.update_id)
    if ACTIVE_DIRECTIVE_FILE.exists():
        try:
            os.remove(ACTIVE_DIRECTIVE_FILE)
        except Exception:
            pass
    return {
        "status": "ok",
        "acknowledged_update_id": req.update_id,
        "last_update_id": poller_worker.last_update_id if poller_worker else req.update_id,
    }


@app.post("/send")
def send_message_endpoint(req: SendMessageRequest):
    """
    Transmit message to designated group chat.
    Supports 4-tier functional emoji doctrine and HTML formatting.
    """
    token = config_state.get("bot_token")
    target_chat = req.chat_id or config_state.get("chat_id")

    if not token or not target_chat:
        raise HTTPException(status_code=400, detail="Missing bot_token or target chat_id.")

    text = req.text.strip()
    if req.emoji and not text.startswith(req.emoji):
        text = f"{req.emoji} {text}"

    success = send_telegram_raw(token, target_chat, text, parse_mode=req.parse_mode)
    if not success:
        raise HTTPException(status_code=502, detail="Failed to deliver message via Telegram Bot API.")

    return {
        "status": "ok",
        "delivered": True,
        "chat_id": target_chat,
    }


@app.post("/queue/clear")
def clear_queue():
    """Purge all pending directives from the in-memory queue."""
    cleared = 0
    while not directive_queue.empty():
        try:
            directive_queue.get_nowait()
            directive_queue.task_done()
            cleared += 1
        except queue.Empty:
            break
    return {"status": "ok", "cleared_count": cleared}


if __name__ == "__main__":
    cfg = load_telegram_config()
    host = cfg.get("host", "127.0.0.1")
    port = cfg.get("port", 20130)
    uvicorn.run(app, host=host, port=port, log_level="warning")
