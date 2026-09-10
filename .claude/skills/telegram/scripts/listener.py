#!/usr/bin/env python3
"""
Smart Telegram Listener & Execution Engine for Faust.
Operates exclusively in the designated group chat.
Now forwards messages to Faust's brain for intelligent processing instead of local if/else logic.
"""

import json
import os
import sys
import time
import queue
import random
import threading
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime
from pathlib import Path
from collections import deque
import glob

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(BASE_DIR, "..", "assets", "telegram_config.json")
LOCK_FILE = os.path.join(BASE_DIR, "telegram_smart_listener.lock")
LOG_FILE = os.path.join(BASE_DIR, "listener.log")
INCOMING_JSONL = os.path.join(BASE_DIR, "telegram_incoming.jsonl")
OUTGOING_JSONL = os.path.join(BASE_DIR, "logs", "telegram_outgoing.jsonl")
PROCESSED_FILE = os.path.join(BASE_DIR, "processed_update_id.txt")
DEDUPLICATION_FILE = os.path.join(BASE_DIR, "processed_ids.json")

# Directories for brain communication
BRAIN_INCOMING_DIR = os.path.join(BASE_DIR, "incoming")
BRAIN_OUTGOING_DIR = os.path.join(BASE_DIR, "outgoing")
ARCHIVE_INCOMING_DIR = os.path.join(BASE_DIR, "archive", "incoming")
ARCHIVE_OUTGOING_DIR = os.path.join(BASE_DIR, "archive", "outgoing")
VISION_STREAM_LOG = os.path.join(BASE_DIR, "vision_stream.log")

# Thread-safe queue for incoming directives
directive_queue = queue.Queue()

# In-memory FIFO deduplication tracking
MAX_DEDUP_HISTORY = 1000
processed_update_ids = deque(maxlen=MAX_DEDUP_HISTORY)
processed_message_ids = deque(maxlen=MAX_DEDUP_HISTORY)
dedup_lock = threading.Lock()


def log_msg(text: str):
    """Log to standard output and log file with immediate flush."""
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{ts}] {text}"
    try:
        print(formatted, flush=True)
    except Exception:
        pass
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(formatted + "\n")
            f.flush()
    except Exception:
        pass


def ensure_logs_dir():
    """Ensure the logs directory exists."""
    logs_dir = os.path.dirname(OUTGOING_JSONL)
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir, exist_ok=True)


def ensure_brain_dirs():
    """Ensure the brain communication and archive directories exist."""
    os.makedirs(BRAIN_INCOMING_DIR, exist_ok=True)
    os.makedirs(BRAIN_OUTGOING_DIR, exist_ok=True)
    os.makedirs(ARCHIVE_INCOMING_DIR, exist_ok=True)
    os.makedirs(ARCHIVE_OUTGOING_DIR, exist_ok=True)


def load_deduplication_data():
    """Load processed IDs from disk for deduplication."""
    global processed_update_ids, processed_message_ids
    with dedup_lock:
        if os.path.exists(DEDUPLICATION_FILE):
            try:
                with open(DEDUPLICATION_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    update_ids = data.get("update_ids", [])
                    message_ids = data.get("message_ids", [])
                    processed_update_ids = deque(update_ids[-MAX_DEDUP_HISTORY:], maxlen=MAX_DEDUP_HISTORY)
                    processed_message_ids = deque(message_ids[-MAX_DEDUP_HISTORY:], maxlen=MAX_DEDUP_HISTORY)
            except Exception as e:
                log_msg(f"[Deduplication] Warning: Could not load deduplication data: {e}")
                processed_update_ids = deque(maxlen=MAX_DEDUP_HISTORY)
                processed_message_ids = deque(maxlen=MAX_DEDUP_HISTORY)


def save_deduplication_data():
    """Save processed IDs to disk for deduplication."""
    with dedup_lock:
        try:
            data = {
                "update_ids": list(processed_update_ids),
                "message_ids": list(processed_message_ids)
            }
            tmp_file = f"{DEDUPLICATION_FILE}.tmp"
            with open(tmp_file, "w", encoding="utf-8") as f:
                json.dump(data, f)
            if os.path.exists(DEDUPLICATION_FILE):
                os.replace(tmp_file, DEDUPLICATION_FILE)
            else:
                os.rename(tmp_file, DEDUPLICATION_FILE)
        except Exception as e:
            log_msg(f"[Deduplication] Failed to save deduplication data: {e}")


def is_duplicate_update(update_id: int) -> bool:
    """Check if update_id has already been processed and record it."""
    with dedup_lock:
        if update_id in processed_update_ids:
            return True
        processed_update_ids.append(update_id)
        return False


def is_duplicate_message(message_id: int) -> bool:
    """Check if message_id has already been processed and record it."""
    if message_id is None:
        return False
    with dedup_lock:
        if message_id in processed_message_ids:
            return True
        processed_message_ids.append(message_id)
        return False


def load_config():
    """Load bot token and group chat ID from config file."""
    try:
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        faust_config_path = os.path.join(project_root, "faust_config.json")
        if os.path.exists(faust_config_path):
            with open(faust_config_path, "r", encoding="utf-8") as f:
                faust_cfg = json.load(f)
                telegram_cfg = faust_cfg.get("telegram", {})
                if not telegram_cfg.get("enabled", True):
                    log_msg("[Telegram Engine] Telegram is disabled via faust_config.json. Listener will not start.")
                    return None, None
    except Exception as e:
        log_msg(f"[Telegram Engine] Warning: Could not read faust_config.json for telegram setting: {e}")

    if not os.path.exists(CONFIG_PATH):
        raise FileNotFoundError(f"Config file not found: {CONFIG_PATH}")
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        cfg = json.load(f)
    bot_token = cfg.get("bot_token")
    chat_id = cfg.get("chat_id")
    if not bot_token or chat_id is None:
        raise ValueError("Missing bot_token or chat_id in telegram_config.json")
    return bot_token, chat_id


def extract_retry_after(error: urllib.error.HTTPError) -> int:
    """Extract retry_after seconds from HTTP 429 response headers or body."""
    try:
        retry_header = error.headers.get("Retry-After")
        if retry_header and retry_header.isdigit():
            return int(retry_header)
        body = error.read().decode("utf-8")
        parsed = json.loads(body)
        params = parsed.get("parameters", {})
        if "retry_after" in params:
            return int(params["retry_after"])
    except Exception:
        pass
    return 0


def send_message(bot_token: str, chat_id: int, text: str) -> bool:
    """Send a message via Telegram Bot API with HTML formatting and rate limit handling."""
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

    max_retries = 3
    base_delay = 1.0

    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                return True
        except urllib.error.HTTPError as e:
            if e.code == 429:
                retry_secs = extract_retry_after(e)
                wait_time = retry_secs if retry_secs > 0 else (base_delay * (2 ** attempt) + random.uniform(0.1, 0.5))
                log_msg(f"[Telegram Engine] Rate limited (429) on sendMessage. Waiting {wait_time:.2f}s before retry.")
                time.sleep(wait_time)
                continue
            elif e.code == 400:
                payload.pop("parse_mode", None)
                fallback_data = json.dumps(payload).encode("utf-8")
                fallback_req = urllib.request.Request(url, data=fallback_data, headers={"Content-Type": "application/json"})
                try:
                    with urllib.request.urlopen(fallback_req, timeout=10) as resp:
                        return True
                except Exception as inner_e:
                    log_msg(f"[Telegram Engine] Failed fallback message send: {inner_e}")
                    return False
            else:
                log_msg(f"[Telegram Engine] HTTP error on sendMessage ({e.code}): {e}")
                return False
        except Exception as e:
            log_msg(f"[Telegram Engine] Failed to send message: {e}")
            if attempt < max_retries - 1:
                time.sleep(base_delay * (2 ** attempt))
                continue
            return False
    return False


def get_updates(bot_token: str, offset=None, timeout=30):
    """Long-poll updates from Telegram Bot API with exponential backoff for HTTP 429 and network errors."""
    url = f"https://api.telegram.org/bot{bot_token}/getUpdates"
    params = {"timeout": timeout}
    if offset is not None:
        params["offset"] = offset
    query_string = urllib.parse.urlencode(params)
    full_url = f"{url}?{query_string}"

    max_retries = 5
    base_delay = 1.5

    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(full_url, timeout=timeout + 5) as resp:
                resp_data = resp.read().decode("utf-8")
                return json.loads(resp_data)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                retry_secs = extract_retry_after(e)
                wait_time = retry_secs if retry_secs > 0 else (base_delay * (2 ** attempt) + random.uniform(0.5, 1.5))
                log_msg(f"[Telegram Engine] Rate limited (429) on getUpdates. Retrying in {wait_time:.2f}s (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait_time)
                continue
            else:
                log_msg(f"[Telegram Engine] HTTP error {e.code} on getUpdates: {e}")
                return {"ok": False, "description": str(e), "result": []}
        except Exception as e:
            if attempt < max_retries - 1:
                delay = base_delay * (2 ** attempt) + random.uniform(0.1, 0.5)
                log_msg(f"[Telegram Engine] Network exception on getUpdates: {e}. Retrying in {delay:.2f}s")
                time.sleep(delay)
                continue
            else:
                log_msg(f"[Telegram Engine] Failed getUpdates after {max_retries} attempts: {e}")
                return {"ok": False, "description": str(e), "result": []}
    return {"ok": False, "description": "Exceeded retry limit", "result": []}


def delete_webhook(bot_token: str) -> bool:
    """Ensure no active webhook blocks getUpdates polling."""
    url = f"https://api.telegram.org/bot{bot_token}/deleteWebhook"
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            resp_data = resp.read().decode("utf-8")
            result = json.loads(resp_data)
            if result.get("ok"):
                log_msg("[Telegram Engine] Webhook cleared successfully.")
                return True
    except Exception as e:
        log_msg(f"[Telegram Engine] Error clearing webhook: {e}")
    return False


def should_respond(message: dict, expected_chat_id: int) -> bool:
    """Filter messages: accept only non-bot messages from the designated group chat."""
    from_user = message.get("from", {})
    if from_user.get("is_bot", False):
        return False

    chat = message.get("chat", {})
    chat_type = chat.get("type")
    chat_id = chat.get("id")

    return chat_type in ["group", "supergroup"] and chat_id == expected_chat_id


def is_pid_running(pid: int) -> bool:
    """Verify if process ID is actively executing on the OS."""
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


def acquire_lock() -> bool:
    """Acquire single-instance mutex lock using atomic file operations. Fails fast if another instance is alive."""
    current_pid = os.getpid()
    max_retries = 3

    for attempt in range(max_retries):
        try:
            if sys.platform != "win32":
                fd = os.open(LOCK_FILE, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
                try:
                    os.write(fd, f"{current_pid}\n".encode())
                    os.close(fd)
                    return True
                except Exception:
                    os.close(fd)
                    return False
            else:
                with open(LOCK_FILE, "x") as f:
                    f.write(str(current_pid))
                return True
        except FileExistsError:
            try:
                with open(LOCK_FILE, "r", encoding="utf-8") as f:
                    pid_str = f.read().strip()
                pid = int(pid_str)
                if pid == current_pid:
                    return True
                if is_pid_running(pid):
                    log_msg(f"[Lock] Active listener instance already running with PID: {pid}. Aborting.")
                    return False
                else:
                    log_msg(f"[Lock] Stale lockfile detected for dead PID {pid}. Cleaning up.")
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
        except Exception as e:
            log_msg(f"[Lock] Error acquiring lock: {e}")
            return False

    return False


def release_lock():
    """Release single-instance mutex lock if owned by current PID."""
    if os.path.exists(LOCK_FILE):
        try:
            with open(LOCK_FILE, "r", encoding="utf-8") as f:
                pid_str = f.read().strip()
            if int(pid_str) == os.getpid():
                os.remove(LOCK_FILE)
        except Exception:
            pass


def load_last_processed() -> int:
    """Return the highest processed update_id."""
    if not os.path.exists(PROCESSED_FILE):
        return 0
    try:
        with open(PROCESSED_FILE, "r", encoding="utf-8") as f:
            content = f.read().strip()
            return int(content) if content else 0
    except Exception:
        return 0


def save_last_processed(update_id: int):
    """Record the highest processed update_id to disk atomically."""
    try:
        tmp_file = f"{PROCESSED_FILE}.tmp"
        with open(tmp_file, "w", encoding="utf-8") as f:
            f.write(str(update_id))
        if os.path.exists(PROCESSED_FILE):
            os.replace(tmp_file, PROCESSED_FILE)
        else:
            os.rename(tmp_file, PROCESSED_FILE)
    except Exception as e:
        log_msg(f"[Telegram Engine] Failed to save processed ID {update_id}: {e}")


def record_incoming_message(update_id: int, message: dict):
    """Append structured message entry to JSONL storage."""
    try:
        from_user = message.get("from", {})
        entry = {
            "timestamp": datetime.now().isoformat(),
            "update_id": update_id,
            "message_id": message.get("message_id"),
            "from_id": from_user.get("id"),
            "from_name": from_user.get("first_name", "") + (" " + from_user.get("last_name", "") if from_user.get("last_name") else ""),
            "username": from_user.get("username", ""),
            "text": message.get("text", ""),
        }
        with open(INCOMING_JSONL, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
            f.flush()
    except Exception as e:
        log_msg(f"[Telegram Engine] Error persisting message record: {e}")


def log_outgoing_message(message_id: int, text: str, direction: str = "out"):
    """Log outgoing message to JSONL storage."""
    try:
        ensure_logs_dir()
        entry = {
            "timestamp": datetime.now().isoformat(),
            "direction": direction,
            "message_id": message_id,
            "text": text,
        }
        with open(OUTGOING_JSONL, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
            f.flush()
    except Exception as e:
        log_msg(f"[Telegram Engine] Error logging outgoing message: {e}")


def save_incoming_message_to_file(update_id: int, message_id: int, text: str, from_name: str):
    """Save incoming message as JSON file and append to stream for brain processing."""
    try:
        ensure_brain_dirs()
        filename = f"incoming_{update_id}_{message_id}.json"
        filepath = os.path.join(BRAIN_INCOMING_DIR, filename)
        data = {
            "update_id": update_id,
            "message_id": message_id,
            "text": text,
            "from_name": from_name,
            "timestamp": datetime.now().isoformat()
        }
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        log_msg(f"[Brain Interface] Saved incoming message to {filename}")

        # Append to vision stream log for real-time streaming into Faust cognitive loop
        try:
            with open(VISION_STREAM_LOG, 'a', encoding='utf-8') as f:
                f.write(f"[VISION_STREAM] update_id={update_id} message_id={message_id} from=\"{from_name}\": {text}\n")
                f.flush()
        except Exception as e:
            log_msg(f"[Brain Interface] Warning: Could not write to vision_stream.log: {e}")

        return True
    except Exception as e:
        log_msg(f"[Brain Interface] Error saving incoming message: {e}")
        return False


def outgoing_watcher_thread(bot_token: str, chat_id: int):
    """Continuously watches outgoing directory and dispatches completed responses to Telegram."""
    log_msg("[Outgoing Watcher] Thread started.")
    while True:
        try:
            ensure_brain_dirs()
            for filepath in glob.glob(os.path.join(BRAIN_OUTGOING_DIR, "*.json")):
                filename = os.path.basename(filepath)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    response_text = data.get("response_text", "")
                    if response_text:
                        if send_message(bot_token, chat_id, response_text):
                            log_outgoing_message(0, response_text, "out")
                            log_msg(f"[Outgoing Watcher] Dispatched response from {filename}")

                    # Atomically move to archive/outgoing
                    archive_path = os.path.join(ARCHIVE_OUTGOING_DIR, filename)
                    try:
                        if os.path.exists(archive_path):
                            os.remove(archive_path)
                        os.replace(filepath, archive_path)
                    except Exception:
                        try:
                            os.remove(filepath)
                        except Exception:
                            pass
                except Exception as e:
                    log_msg(f"[Outgoing Watcher] Error processing {filename}: {e}")
            time.sleep(1.0)
        except Exception as e:
            log_msg(f"[Outgoing Watcher] Loop error: {e}")
            time.sleep(2.0)


def worker_thread(bot_token: str, chat_id: int):
    """Worker thread that receives directives from the queue and saves them for the brain."""
    log_msg("[Brain Interface Worker] Thread started.")
    while True:
        try:
            item = directive_queue.get(timeout=1.0)
            if item is None:
                break

            update_id, message = item
            from_name = message.get("from", {}).get("first_name", "Unknown")
            text = message.get("text", "")

            # Phase 2: Intake Acknowledgment
            clean_snippet = text if len(text) <= 80 else text[:77] + "..."
            ack_msg = f"🔄 <b>Prescript Received.</b>"
            if send_message(bot_token, chat_id, ack_msg):
                log_outgoing_message(0, ack_msg, "out")

            # Save message to file & stream log for brain processing
            message_id = message.get("message_id", 0)
            if not save_incoming_message_to_file(update_id, message_id, text, from_name):
                error_msg = "❌ <b>Brain Interface Error</b>\nFailed to forward vision to cognitive storage."
                send_message(bot_token, chat_id, error_msg)
                log_outgoing_message(0, error_msg, "out")

            directive_queue.task_done()

        except queue.Empty:
            continue
        except Exception as e:
            log_msg(f"[Brain Interface Worker] Error in worker thread: {e}")
            try:
                error_msg = f"❌ <b>Worker Error</b>\n<code>{str(e)}</code>"
                if send_message(bot_token, chat_id, error_msg):
                    log_outgoing_message(0, error_msg, "out")
            except Exception:
                pass


def main():
    """Main entry point for the Telegram Smart Listener & Execution Engine."""
    log_msg("=" * 50)
    log_msg("Faust Telegram Smart Listener & Execution Engine")
    log_msg("Starting up...")
    log_msg("=" * 50)

    try:
        bot_token, chat_id = load_config()
        if not bot_token or not chat_id:
            log_msg("[Telegram Engine] Telegram is disabled or not configured. Exiting listener.")
            return 0
        log_msg(f"[Config] Loaded configuration for chat ID: {chat_id}")

        load_deduplication_data()

        # Acquire single-instance lock (fails fast if another process runs)
        if not acquire_lock():
            log_msg("[Fatal] Could not acquire lock. Another instance is already active. Exiting.")
            return 1

        log_msg("[Lock] Single-instance lock acquired.")

        # Clear any existing webhook
        delete_webhook(bot_token)

        # Startup announcement (Phase 1)
        startup_msg = "⚡ <b>Faust Online:</b> Strategic command link established."
        log_msg(f"[Telegram Engine] Dispatching startup notice: {startup_msg}")
        if send_message(bot_token, chat_id, startup_msg):
            log_outgoing_message(0, startup_msg, "out")

        # Start worker thread
        worker = threading.Thread(target=worker_thread, args=(bot_token, chat_id), daemon=True)
        worker.start()
        log_msg("[Worker] Executive worker thread started.")

        # Start outgoing watcher thread
        outgoing_watcher = threading.Thread(target=outgoing_watcher_thread, args=(bot_token, chat_id), daemon=True)
        outgoing_watcher.start()
        log_msg("[Worker] Outgoing response watcher thread started.")

        # Main polling loop
        log_msg("[Main] Starting long-poll loop for updates...")
        last_update_id = load_last_processed()

        while True:
            try:
                updates = get_updates(bot_token, offset=last_update_id + 1, timeout=30)

                if not updates.get("ok", False):
                    log_msg(f"[Polling] GetUpdates failed: {updates.get('description', 'Unknown error')}")
                    time.sleep(5)
                    continue

                for update in updates.get("result", []):
                    update_id = update["update_id"]
                    message = update.get("message", {})

                    # Always advance offset
                    if update_id > last_update_id:
                        last_update_id = update_id
                        save_last_processed(last_update_id)

                    # Filter chat/bot
                    if not should_respond(message, chat_id):
                        continue

                    # Deduplication check on update_id
                    if is_duplicate_update(update_id):
                        log_msg(f"[Duplicate] Skipping already processed update_id: {update_id}")
                        continue

                    message_id = message.get("message_id")
                    if is_duplicate_message(message_id):
                        log_msg(f"[Duplicate] Skipping already processed message_id: {message_id}")
                        continue

                    record_incoming_message(update_id, message)
                    directive_queue.put((update_id, message))
                    log_msg(f"[Queue] Queued directive from {message.get('from', {}).get('first_name', 'Unknown')}: {message.get('text', '')}")

                    # Periodic persist of deduplication window
                    if update_id % 10 == 0:
                        save_deduplication_data()

            except KeyboardInterrupt:
                log_msg("[Shutdown] Keyboard interrupt received.")
                break
            except Exception as e:
                log_msg(f"[Main] Error in main loop: {e}")
                time.sleep(5)

    except Exception as e:
        log_msg(f"[Fatal] Unhandled exception in main: {e}")
        return 1
    finally:
        log_msg("[Shutdown] Initiating shutdown sequence...")
        save_deduplication_data()
        release_lock()
        directive_queue.put(None)
        log_msg("[Shutdown] Shutdown complete.")

    return 0


if __name__ == "__main__":
    sys.exit(main())