#!/usr/bin/env python3
"""
Faust Cortex Gatekeeper Daemon (Port 20131)
Deterministic Zero-LLM Memory Key Resolver & Access Firewall.

Architecture & Golden Standards:
  - Zero LLM in runtime path: 100% deterministic capability-based access control (CBAC).
  - Scans `.claude/memory/*.md` frontmatter for `key:` and `keys:`.
  - Filters and resolves memory files strictly matching the requesting agent's authorized keys.
  - Blocks unauthorized access and isolates `omni:*` lore to Omniscient Faust ("*").
  - Provides instant file lists and memory bundles for single-turn agent bootstrapping.
"""

import fnmatch
import json
import os
import re
import sys
import threading
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import parse_qs, urlparse

BASE_DIR = Path(__file__).resolve().parent
CLAUDE_DIR = BASE_DIR.parent
PROJECT_ROOT = CLAUDE_DIR.parent
MEMORY_DIR = CLAUDE_DIR / "memory"
LOGS_DIR = BASE_DIR / "logs"
LOG_FILE = LOGS_DIR / "cortex_daemon.log"
LOCK_FILE = BASE_DIR / "cortex_daemon.lock"

HOST = "127.0.0.1"
PORT = 20135

LOGS_DIR.mkdir(parents=True, exist_ok=True)


def log(msg: str, level: str = "INFO"):
    timestamp = datetime.now().strftime("%H:%M:%S")
    line = f"[{timestamp}] [faust.cortex_gatekeeper] {level}: {msg}"
    print(line)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


def parse_frontmatter(file_path: Path) -> Dict[str, Any]:
    """Parse YAML frontmatter from a markdown file without external dependencies."""
    meta: Dict[str, Any] = {
        "name": file_path.stem,
        "key": "",
        "keys": [],
        "description": "",
    }
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        if not content.startswith("---"):
            return meta

        parts = content.split("---", 2)
        if len(parts) < 3:
            return meta

        yaml_block = parts[1]
        lines = yaml_block.splitlines()

        current_list_key = None
        for raw_line in lines:
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue

            # List item parsing
            if line.startswith("- ") and current_list_key:
                val = line[2:].strip().strip('"').strip("'")
                if current_list_key in meta and isinstance(meta[current_list_key], list):
                    meta[current_list_key].append(val)
                continue

            if ":" in line:
                key, val = line.split(":", 1)
                key = key.strip()
                val = val.strip().strip('"').strip("'")

                if key in ["keys"]:
                    current_list_key = key
                    if key not in meta or not isinstance(meta[key], list):
                        meta[key] = []
                    if val:  # Inline array [a, b]
                        val_cleaned = val.strip("[]")
                        if val_cleaned:
                            meta[key].extend([v.strip().strip('"').strip("'") for v in val_cleaned.split(",")])
                            current_list_key = None
                else:
                    current_list_key = None
                    meta[key] = val

        # Normalize key into keys list
        if meta.get("key") and meta["key"] not in meta["keys"]:
            meta["keys"].insert(0, meta["key"])

    except Exception as e:
        log(f"Error parsing frontmatter from {file_path.name}: {e}", "WARNING")

    return meta


class MemoryCortexIndex:
    """In-memory cache of memory components, auto-refreshed on change."""

    def __init__(self, memory_dir: Path):
        self.memory_dir = memory_dir
        self.files_cache: List[Dict[str, Any]] = []
        self.last_scanned: float = 0
        self.refresh()

    def refresh(self):
        if not self.memory_dir.exists():
            self.files_cache = []
            return

        new_cache = []
        for p in sorted(self.memory_dir.rglob("*.md")):
            if p.name == "MEMORY.md":
                continue
            meta = parse_frontmatter(p)
            meta["path"] = str(p.resolve())
            meta["filename"] = p.name
            meta["rel_path"] = str(p.relative_to(self.memory_dir)).replace("\\", "/")
            new_cache.append(meta)

        self.files_cache = new_cache
        self.last_scanned = datetime.now().timestamp()
        log(f"Indexed {len(self.files_cache)} memory components across subfolders from {self.memory_dir.name}")

    def resolve(self, requested_keys: List[str]) -> List[Dict[str, Any]]:
        """
        Deterministic capability-based filter.
        Matches requested keys against component frontmatter keys.
        """
        if not requested_keys:
            return []

        # Check for Omni Master Key
        is_omni = "*" in requested_keys or "omni:*" in requested_keys or "omni" in requested_keys

        allowed_components: List[Dict[str, Any]] = []

        for comp in self.files_cache:
            comp_keys = comp.get("keys", [])
            primary_key = comp.get("key", "")
            all_keys = list(set(comp_keys + ([primary_key] if primary_key else [])))

            # If no keys declared, fallback to slug
            if not all_keys:
                all_keys = [f"ref:{comp['name']}"]

            # Omniscient key gets 100% of files
            if is_omni:
                allowed_components.append(comp)
                continue

            # Non-omni agents are STRICTLY blocked from omni:* lore
            rel_path = comp.get("rel_path", "")
            if rel_path.startswith("omni/") or any(k.startswith("omni:") for k in all_keys):
                continue

            # Wildcard pattern matching (e.g., 'div:ui:*' matches 'div:ui:design_system')
            matched = False
            for req_key in requested_keys:
                for comp_key in all_keys:
                    if fnmatch.fnmatch(comp_key, req_key):
                        matched = True
                        break
                if matched:
                    break

            if matched:
                allowed_components.append(comp)

        return allowed_components

    def bundle(self, requested_keys: List[str]) -> str:
        """Concatenates all allowed memory files into a clean markdown document."""
        allowed = self.resolve(requested_keys)
        bundle_parts = [
            f"# Faust Resolved Memory Bundle",
            f"*Generated by Faust Cortex Gatekeeper Daemon at {datetime.now().isoformat()}*",
            f"*Requested Keys: {', '.join(requested_keys)}*",
            f"*Components Allowed: {len(allowed)}*\n",
            "---\n",
        ]

        for comp in allowed:
            file_path = Path(comp["path"])
            bundle_parts.append(f"## Component: {comp['name']} (Key: {comp.get('key', 'unknown')})")
            bundle_parts.append(f"Path: `{comp['path']}`\n")
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    bundle_parts.append(f.read())
            except Exception as e:
                bundle_parts.append(f"*Error reading component file: {e}*")
            bundle_parts.append("\n---\n")

        return "\n".join(bundle_parts)


cortex_index = MemoryCortexIndex(MEMORY_DIR)


class CortexHTTPHandler(BaseHTTPRequestHandler):
    def _send_json(self, status_code: int, data: Dict[str, Any]):
        response_bytes = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(response_bytes)

    def _send_text(self, status_code: int, text: str):
        response_bytes = text.encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "text/markdown; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/health":
            self._send_json(200, {
                "status": "ok",
                "service": "faust-cortex-gatekeeper",
                "port": PORT,
                "indexed_components": len(cortex_index.files_cache),
                "timestamp": datetime.now().isoformat(),
            })
            return

        if path == "/refresh":
            cortex_index.refresh()
            self._send_json(200, {
                "status": "ok",
                "message": "Memory cortex re-indexed successfully.",
                "indexed_components": len(cortex_index.files_cache),
            })
            return

        if path == "/resolve":
            params = parse_qs(parsed.query)
            keys_param = params.get("keys", [""])[0]
            keys_list = [k.strip() for k in keys_param.split(",") if k.strip()]
            allowed = cortex_index.resolve(keys_list)
            self._send_json(200, {
                "status": "ok",
                "requested_keys": keys_list,
                "count": len(allowed),
                "allowed_components": allowed,
            })
            return

        if path == "/list_all":
            self._send_json(200, {
                "status": "ok",
                "count": len(cortex_index.files_cache),
                "components": cortex_index.files_cache,
            })
            return

        self._send_json(404, {"status": "error", "message": "Not Found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        content_len = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_len) if content_len > 0 else b"{}"

        try:
            body = json.loads(post_data.decode("utf-8")) if post_data else {}
        except Exception:
            self._send_json(400, {"status": "error", "message": "Invalid JSON body"})
            return

        if path == "/resolve":
            keys_list = body.get("keys", [])
            if isinstance(keys_list, str):
                keys_list = [k.strip() for k in keys_list.split(",") if k.strip()]

            allowed = cortex_index.resolve(keys_list)
            self._send_json(200, {
                "status": "ok",
                "requested_keys": keys_list,
                "count": len(allowed),
                "allowed_components": allowed,
            })
            return

        if path == "/bundle":
            keys_list = body.get("keys", [])
            if isinstance(keys_list, str):
                keys_list = [k.strip() for k in keys_list.split(",") if k.strip()]

            bundle_md = cortex_index.bundle(keys_list)
            self._send_text(200, bundle_md)
            return

        if path == "/shutdown":
            self._send_json(200, {"status": "ok", "message": "Shutting down cortex daemon."})
            log("Received shutdown request via HTTP.")
            threading.Thread(target=self.server.shutdown).start()
            return

        self._send_json(404, {"status": "error", "message": "Not Found"})

    def log_message(self, format, *args):
        # Suppress noisy standard HTTP access logs
        return


def run_cortex_daemon():
    log(f"Starting Faust Cortex Gatekeeper Daemon on http://{HOST}:{PORT}...")

    # Write Lockfile
    try:
        with open(LOCK_FILE, "w", encoding="utf-8") as f:
            f.write(str(os.getpid()))
    except Exception as e:
        log(f"Warning: Could not write lockfile: {e}", "WARNING")

    server = ThreadingHTTPServer((HOST, PORT), CortexHTTPHandler)
    log(f"Faust Cortex Gatekeeper listening on {HOST}:{PORT} [READY]")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log("Cortex Gatekeeper interrupted by user.")
    finally:
        server.server_close()
        if LOCK_FILE.exists():
            try:
                os.remove(LOCK_FILE)
            except Exception:
                pass
        log("Cortex Gatekeeper stopped cleanly.")


if __name__ == "__main__":
    run_cortex_daemon()
