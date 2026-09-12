#!/usr/bin/env python3
"""
Faust Daemon Supervisor & Watchdog (Tier 2.5 Resilient Process Manager)
Maintains high-availability self-healing supervision over Faust's sovereign background daemons:
  1. Audio Daemon (Port 20129)
  2. Telegram Daemon (Port 20130)

Invariants:
  - Zero LLM in runtime watchdog loop: deterministic healthcheck, process spawn, and crash auto-restart.
  - Exponential backoff on crash loops (max 5 consecutive retries).
  - Escalation Hook: If a daemon fails >5 times consecutively, writes diagnostic payload to
    `logs/escalations/` and notifies group chat to trigger Faust-ND diagnosis.
"""

import json
import os
import subprocess
import sys
import time
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

BASE_DIR = Path(__file__).resolve().parent
CLAUDE_DIR = BASE_DIR.parent
PROJECT_ROOT = CLAUDE_DIR.parent
SOUND_SKILL_DIR = CLAUDE_DIR / "skills" / "sound"
TELEGRAM_SKILL_DIR = CLAUDE_DIR / "skills" / "telegram"

LOGS_DIR = BASE_DIR / "logs"
ESCALATIONS_DIR = LOGS_DIR / "escalations"
CONFIG_PATH = CLAUDE_DIR / "faust_config.json"
FALLBACK_CONFIG_PATH = PROJECT_ROOT / "faust_config.json"
WATCHDOG_LOG = LOGS_DIR / "watchdog.log"
WATCHDOG_LOCK = BASE_DIR / "watchdog.lock"

DAEMONS = {
    "audio": {
        "script": SOUND_SKILL_DIR / "daemon" / "audio_daemon.py",
        "url": "http://127.0.0.1:20129/health",
        "port": 20129,
        "max_retries": 5,
    },
    "telegram": {
        "script": TELEGRAM_SKILL_DIR / "daemon" / "telegram_daemon.py",
        "url": "http://127.0.0.1:20130/health",
        "port": 20130,
        "max_retries": 5,
    },
    "cortex": {
        "script": BASE_DIR / "cortex_daemon.py",
        "url": "http://127.0.0.1:20135/health",
        "port": 20135,
        "max_retries": 5,
    },
}

LOGS_DIR.mkdir(parents=True, exist_ok=True)
ESCALATIONS_DIR.mkdir(parents=True, exist_ok=True)


def log(msg: str, level: str = "INFO"):
    timestamp = datetime.now().strftime("%H:%M:%S")
    line = f"[{timestamp}] [faust.watchdog] {level}: {msg}"
    print(line)
    try:
        with open(WATCHDOG_LOG, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


def is_service_healthy(url: str) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Faust-Watchdog/1.0"}, method="GET")
        with urllib.request.urlopen(req, timeout=0.8) as resp:
            return resp.status == 200
    except Exception:
        return False


def spawn_daemon(name: str, script_path: Path) -> subprocess.Popen:
    python_exe = sys.executable
    log(f"Spawning {name} daemon ({script_path.name})...")

    # Spawn detached background process
    if os.name == "nt":
        creationflags = subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS
        proc = subprocess.Popen(
            [python_exe, str(script_path)],
            cwd=str(PROJECT_ROOT),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creationflags,
        )
    else:
        proc = subprocess.Popen(
            [python_exe, str(script_path)],
            cwd=str(PROJECT_ROOT),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True,
        )
    return proc


def get_log_tail(daemon_name: str, lines: int = 50) -> str:
    """Retrieve the last N lines from the daemon's log file."""
    if daemon_name == "audio":
        log_path = SOUND_SKILL_DIR / "logs" / "audio_daemon.log"
    elif daemon_name == "telegram":
        log_path = TELEGRAM_SKILL_DIR / "logs" / "telegram_daemon.log"
    else:
        log_path = LOGS_DIR / f"{daemon_name}_daemon.log"

    if not log_path.exists():
        return "Log file not found."
    try:
        with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
            all_lines = f.readlines()
            return "".join(all_lines[-lines:])
    except Exception as e:
        return f"Error reading log: {e}"


def escalate_to_faust_nd(daemon_name: str, error_context: Dict[str, Any]):
    """Record escalation packet for Stratum I (Faust-ND) diagnostic review."""
    timestamp_slug = datetime.now().strftime("%Y%m%d_%H%M%S")
    escalation_file = ESCALATIONS_DIR / f"escalation_{daemon_name}_{timestamp_slug}.json"

    log_tail = get_log_tail(daemon_name, 50)

    payload = {
        "target_stratum": "Faust-ND (Stratum I Strategic Inquisitor / Theorist)",
        "daemon": daemon_name,
        "timestamp": datetime.now().isoformat(),
        "status": "UNRECOVERABLE_RESTART_FAILURE",
        "consecutive_failures": error_context.get("consecutive_failures", 5),
        "last_log_tail": log_tail,
        "recommended_action": "Execute root-cause architecture audit and dependency diagnostic.",
    }

    try:
        with open(escalation_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        log(f"Escalation packet generated: {escalation_file.name}", "WARNING")
    except Exception as e:
        log(f"Failed to write escalation file: {e}", "ERROR")

    # Send high-priority alert to group chat if Telegram bridge is available
    try:
        skills_dir = PROJECT_ROOT / ".claude" / "skills"
        if str(skills_dir) not in sys.path:
            sys.path.insert(0, str(skills_dir))
        from telegram import notify
        notify(
            f"<b>Daemon Unrecoverable:</b> <code>{daemon_name}</code> exceeded max restart attempts. Escalated to Faust-ND for architectural diagnosis.",
            emoji="❌",
        )
    except Exception:
        pass


def run_watchdog():
    log("Initializing Faust Daemon Watchdog Supervisor...")

    # Mutex lock check
    if WATCHDOG_LOCK.exists():
        try:
            with open(WATCHDOG_LOCK, "r", encoding="utf-8") as f:
                old_pid = int(f.read().strip())
            if old_pid != os.getpid():
                log(f"Stale watchdog lock for PID {old_pid} replaced.")
        except Exception:
            pass
    with open(WATCHDOG_LOCK, "w", encoding="utf-8") as f:
        f.write(str(os.getpid()))

    failure_counts = {"audio": 0, "telegram": 0}
    procs: Dict[str, Optional[subprocess.Popen]] = {"audio": None, "telegram": None}

    try:
        while True:
            for name, spec in DAEMONS.items():
                healthy = is_service_healthy(spec["url"])
                if healthy:
                    if failure_counts[name] > 0:
                        log(f"{name.capitalize()} daemon recovered. Resetting failure counter.")
                    failure_counts[name] = 0
                else:
                    failure_counts[name] += 1
                    log(
                        f"{name.capitalize()} daemon healthcheck FAILED (attempt {failure_counts[name]}/{spec['max_retries']})",
                        "WARNING",
                    )

                    if failure_counts[name] > spec["max_retries"]:
                        escalate_to_faust_nd(name, {"consecutive_failures": failure_counts[name]})
                        # Back off longer before retrying again
                        time.sleep(30)
                        continue

                    # Attempt restart
                    spawn_daemon(name, spec["script"])
                    # Give process 2 seconds to warm up
                    time.sleep(2.0)

            time.sleep(5.0)
    except KeyboardInterrupt:
        log("Watchdog terminated by user.")
    finally:
        if WATCHDOG_LOCK.exists():
            try:
                os.remove(WATCHDOG_LOCK)
            except Exception:
                pass


if __name__ == "__main__":
    run_watchdog()
