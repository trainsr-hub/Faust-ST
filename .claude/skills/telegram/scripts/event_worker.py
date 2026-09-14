#!/usr/bin/env python3
"""
Faust Telegram Event-Driven Worker (Real Headless Execution Bridge)
Supervised by Faust Watchdog (Port 20131).

Listens on Telegram Dumb I/O Daemon (Port 20130).
When a directive arrives:
1. Dispatches an initial progress card & acoustic intake alert.
2. Spawns Claude Code to execute real tool actions (Read, Edit, Write, PowerShell) across the workspace.
3. Updates the Telegram progress card in-place with the REAL tools and files being modified in real time.
4. Transmits the real debrief report and vocalizes voice completion through speakers.
5. Commits transactional ACK to SQLite queue.
"""

import argparse
import asyncio
import json
import logging
import os
import re
import signal
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("FaustTelegramWorker")

PROJECT_ROOT = Path(__file__).resolve().parents[4]
CONFIG_PATH = PROJECT_ROOT / ".claude" / "faust_config.json"


def load_config() -> Dict[str, Any]:
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}


class FaustTelegramRealWorker:
    def __init__(self, poll_interval: float = 1.5, health_port: int = 20131):
        self.config = load_config()
        self.tg_cfg = self.config.get("telegram", {})
        self.token = self.tg_cfg.get("bot_token", "")
        self.chat_id = self.tg_cfg.get("chat_id", -1004405650953)
        self.manager_id = self.tg_cfg.get("manager_user_id", 8016442589)
        self.daemon_port = self.tg_cfg.get("port", 20130)
        self.health_port = health_port
        self.poll_interval = poll_interval
        self._running = True
        self.start_time = time.time()
        self.processed_count = 0

    def _http_post(self, url: str, payload: Optional[Dict[str, Any]] = None) -> Any:
        data_bytes = json.dumps(payload).encode("utf-8") if payload is not None else None
        headers = {"Content-Type": "application/json"} if payload is not None else {}
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                body = resp.read().decode("utf-8")
                return json.loads(body) if body else None
        except Exception:
            return None

    def pop_directive(self) -> Optional[Dict[str, Any]]:
        """Atomically pop the oldest pending directive from the resident daemon."""
        url = f"http://127.0.0.1:{self.daemon_port}/messages/pop"
        res = self._http_post(url)
        if res and res.get("directive"):
            return res["directive"]
        return None

    def ack_directive(self, update_id: int):
        """Commit processed directive to SQLite WAL queue."""
        url = f"http://127.0.0.1:{self.daemon_port}/messages/ack"
        self._http_post(url, {"update_id": update_id})

    def speak(self, text: str):
        """Synthesize acoustic feedback via resident audio daemon (Port 20129)."""
        audio_port = self.config.get("acoustic_presence", {}).get("port", 20129)
        url = f"http://127.0.0.1:{audio_port}/speak"
        self._http_post(url, {"text": text, "speed": 0.84, "voice": "af_bella"})

    def send_initial_card(self, directive_text: str) -> Optional[int]:
        """Dispatch initial in-place progress card to Telegram."""
        if not self.token:
            return None
        lines = [
            f"🔄 <b>Prescript Received:</b> <i>{directive_text}</i>",
            "<b>Engineering Pipeline:</b> <code>Faust Autonomous Core Active</code>",
            "",
            "[1/1] ⏳ <b>Analyzing workspace & initiating steps...</b>"
        ]
        url = f"https://api.telegram.org/bot{self.token}/sendMessage"
        payload = {"chat_id": self.chat_id, "text": "\n".join(lines), "parse_mode": "HTML"}
        res = self._http_post(url, payload)
        if res and res.get("ok"):
            return res.get("result", {}).get("message_id")
        return None

    def update_card(self, msg_id: int, directive_text: str, active_steps: List[Dict[str, Any]], is_done: bool = False, final_summary: str = ""):
        """Update Telegram card in-place via editMessageText with real tool actions."""
        if not self.token or not msg_id:
            return
        lines = [
            f"🔄 <b>Prescript:</b> <i>{directive_text}</i>",
            ""
        ]

        display_steps = active_steps[-6:] if len(active_steps) > 6 else active_steps
        for idx, step in enumerate(display_steps, 1):
            name = step.get("name", "Tool")
            status = step.get("status", "running")
            dur = step.get("duration", 0)

            if status == "completed":
                lines.append(f"[{idx}/{len(display_steps)}] ✅ <b>{name}</b> <code>({dur}ms)</code>")
            elif status == "running":
                lines.append(f"[{idx}/{len(display_steps)}] ⏳ <b>{name}</b> <i>(Executing...)</i>")
            elif status == "failed":
                lines.append(f"[{idx}/{len(display_steps)}] ❌ <b>{name}</b>")
            else:
                lines.append(f"[{idx}/{len(display_steps)}] ⚪ {name}")

        if is_done:
            lines.append("")
            lines.append(f"⚡ <b>Execution Complete.</b> {final_summary or 'Task verified.'}")

        text = "\n".join(lines)
        url = f"https://api.telegram.org/bot{self.token}/editMessageText"
        payload = {"chat_id": self.chat_id, "message_id": msg_id, "text": text, "parse_mode": "HTML"}
        self._http_post(url, payload)

    def send_final_report(self, report_text: str):
        """Send complete debriefing report to Telegram."""
        if not self.token or not report_text:
            return
        chunks = [report_text[i:i+3800] for i in range(0, len(report_text), 3800)]
        for chunk in chunks:
            url = f"https://api.telegram.org/bot{self.token}/sendMessage"
            payload = {
                "chat_id": self.chat_id,
                "text": f"✅ <b>Task Complete:</b>\n\n{chunk}",
                "parse_mode": "HTML"
            }
            res = self._http_post(url, payload)
            if not res or not res.get("ok"):
                payload.pop("parse_mode", None)
                self._http_post(url, payload)

    async def execute_real_claude_directive(self, directive: Dict[str, Any]):
        """Execute real Claude Code headless session and stream live tool actions to Telegram."""
        text = directive.get("text", "").strip()
        update_id = directive.get("update_id", 0)
        from_name = directive.get("from_name", "Manager")

        logger.info(f"🚀 [REAL EXECUTION] Spawning Claude Code for directive from {from_name}: {text}")

        msg_id = self.send_initial_card(text)
        self.speak("Executing your directive, Manager.")

        full_prompt = (
            f"You are Faust acting on an autonomous remote directive from the Manager via Telegram C2.\n"
            f"Directive: {text}\n"
            f"Execute the necessary analysis, file modifications (Read, Edit, Write), and verification tests (PowerShell/Bash) "
            f"directly in the workspace at {PROJECT_ROOT}. When complete, provide a concise, sharp technical summary."
        )

        cmd = [
            "claude",
            "-p", full_prompt,
            "--output-format", "stream-json",
            "--verbose"
        ]

        active_steps: List[Dict[str, Any]] = []
        final_result_text = ""
        t_start = time.time()
        last_update_time = 0.0

        creationflags = subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0
        try:
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                cwd=str(PROJECT_ROOT),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                creationflags=creationflags
            )

            current_tool_step = None
            tool_start_time = time.time()

            while True:
                line = await proc.stdout.readline()
                if not line:
                    break

                line_str = line.decode("utf-8", errors="ignore").strip()
                if not line_str or not line_str.startswith("{"):
                    continue

                try:
                    event = json.loads(line_str)
                    ev_type = event.get("type")

                    if ev_type == "assistant":
                        msg_obj = event.get("message", {})
                        contents = msg_obj.get("content", [])
                        for item in contents:
                            if item.get("type") == "tool_use":
                                tool_name = item.get("name", "Tool")
                                tool_input = item.get("input", {})

                                if tool_name in ["Read", "Edit", "Write"]:
                                    fpath = tool_input.get("file_path", "")
                                    fname = Path(fpath).name if fpath else "File"
                                    step_label = f"{tool_name} {fname}"
                                elif tool_name in ["PowerShell", "Bash"]:
                                    cmd_str = tool_input.get("command", "")
                                    cmd_preview = cmd_str[:30] + "..." if len(cmd_str) > 30 else cmd_str
                                    step_label = f"Exec: {cmd_preview}"
                                elif tool_name == "Grep":
                                    step_label = f"Grep '{tool_input.get('pattern', '')}'"
                                elif tool_name == "Glob":
                                    step_label = f"Glob '{tool_input.get('pattern', '')}'"
                                else:
                                    step_label = f"{tool_name}"

                                if current_tool_step:
                                    current_tool_step["status"] = "completed"
                                    current_tool_step["duration"] = int((time.time() - tool_start_time) * 1000)

                                current_tool_step = {"name": step_label, "status": "running", "duration": 0}
                                active_steps.append(current_tool_step)
                                tool_start_time = time.time()

                                if time.time() - last_update_time > 0.8:
                                    self.update_card(msg_id, text, active_steps)
                                    last_update_time = time.time()

                    elif ev_type == "result":
                        final_result_text = event.get("result", "")

                except json.JSONDecodeError:
                    pass

            await proc.wait()

            if current_tool_step:
                current_tool_step["status"] = "completed"
                current_tool_step["duration"] = int((time.time() - tool_start_time) * 1000)

            total_elapsed = time.time() - t_start

            self.update_card(
                msg_id, text, active_steps, is_done=True,
                final_summary=f"Processed in {total_elapsed:.1f}s • {len(active_steps)} Real Actions Executed."
            )

            # Do not send redundant completion report message; in-place card & acoustic presence provide clean, complete feedback.

            self.speak("Directive completed successfully, Manager.")
            self.ack_directive(update_id)
            self.processed_count += 1

            logger.info(f"✅ [REAL EXECUTION COMPLETE] Directive {update_id} finished in {total_elapsed:.2f}s. Tools executed: {len(active_steps)}")

        except Exception as e:
            logger.error(f"❌ Error during real Claude execution: {e}")
            self.update_card(msg_id, text, active_steps, is_done=True, final_summary=f"Execution error: {e}")
            self.ack_directive(update_id)

    async def _health_handler(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
        try:
            req_line = await reader.readline()
            while True:
                line = await reader.readline()
                if line in [b"\r\n", b"\n", b""]:
                    break
            body = json.dumps({
                "status": "ok",
                "service": "faust-telegram-real-worker",
                "uptime_seconds": round(time.time() - self.start_time, 1),
                "processed_count": self.processed_count,
                "real_execution": True
            }).encode("utf-8")
            resp = (
                f"HTTP/1.1 200 OK\r\n"
                f"Content-Type: application/json\r\n"
                f"Content-Length: {len(body)}\r\n"
                f"Connection: close\r\n\r\n"
            ).encode("utf-8") + body
            writer.write(resp)
            await writer.drain()
        except Exception:
            pass
        finally:
            writer.close()

    async def run(self):
        logger.info("🛡️  Faust Real-Execution Telegram Worker Online.")
        logger.info(f"Connected to Claude Code CLI. Listening on Port {self.daemon_port}. Healthcheck on Port {self.health_port}.\n")

        try:
            health_server = await asyncio.start_server(self._health_handler, "127.0.0.1", self.health_port)
        except Exception as e:
            logger.warning(f"Could not bind healthcheck server on port {self.health_port}: {e}")
            health_server = None

        while self._running:
            try:
                directive = self.pop_directive()
                if directive:
                    await self.execute_real_claude_directive(directive)
                await asyncio.sleep(self.poll_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Worker loop error: {e}")
                await asyncio.sleep(self.poll_interval)

        if health_server:
            health_server.close()
            await health_server.wait_closed()

        logger.info("🛑 Faust Real Telegram Worker stopped.")


def main():
    parser = argparse.ArgumentParser(description="Faust Real-Execution Telegram Worker")
    parser.add_argument("--interval", type=float, default=1.5, help="Polling interval in seconds")
    parser.add_argument("--port", type=int, default=20131, help="Healthcheck port for watchdog")
    args = parser.parse_args()

    worker = FaustTelegramRealWorker(poll_interval=args.interval, health_port=args.port)

    def sig_handler(sig, frame):
        logger.info("\nStopping Faust Real Telegram Worker...")
        worker._running = False

    signal.signal(signal.SIGINT, sig_handler)
    signal.signal(signal.SIGTERM, sig_handler)

    try:
        asyncio.run(worker.run())
    except Exception as e:
        logger.error(f"Fatal error: {e}")


if __name__ == "__main__":
    main()
