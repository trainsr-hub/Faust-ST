#!/usr/bin/env python3
"""
Faust Deterministic Memory Resolver CLI (Zero-LLM Tool)
Resolves allowed memory paths and bundles given an agent's authorized keys.

Usage:
  # Query daemon or fallback to direct disk resolution:
  python resolve_memory.py "core:codex" "div:ui:*"

  # Return raw JSON:
  python resolve_memory.py --json "core:*" "div:backend:*"

  # Generate full markdown bundle:
  python resolve_memory.py --bundle "core:codex" "div:ui:*"

  # Omni-Key (Resolves everything including restricted lore):
  python resolve_memory.py "omni:*"
"""

import fnmatch
import json
import sys
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional

CLAUDE_DIR = Path(__file__).resolve().parent.parent
MEMORY_DIR = CLAUDE_DIR / "memory"
DAEMON_URL = "http://127.0.0.1:20135"


def query_daemon_resolve(keys: List[str]) -> Optional[List[Dict[str, Any]]]:
    """Attempt to resolve keys via resident Cortex Daemon on Port 20131."""
    try:
        req_data = json.dumps({"keys": keys}).encode("utf-8")
        req = urllib.request.Request(
            f"{DAEMON_URL}/resolve",
            data=req_data,
            headers={"Content-Type": "application/json", "User-Agent": "Faust-Resolver-CLI/1.0"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=0.8) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                return data.get("allowed_components", [])
    except Exception:
        return None
    return None


def parse_frontmatter(file_path: Path) -> Dict[str, Any]:
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
                    if val:
                        val_cleaned = val.strip("[]")
                        if val_cleaned:
                            meta[key].extend([v.strip().strip('"').strip("'") for v in val_cleaned.split(",")])
                            current_list_key = None
                else:
                    current_list_key = None
                    meta[key] = val

        if meta.get("key") and meta["key"] not in meta["keys"]:
            meta["keys"].insert(0, meta["key"])

    except Exception:
        pass

    return meta


def resolve_offline(keys: List[str], memory_dir: Path) -> List[Dict[str, Any]]:
    """Deterministic offline fallback resolution directly against disk."""
    if not memory_dir.exists():
        return []

    is_omni = "*" in keys or "omni:*" in keys or "omni" in keys
    allowed = []

    for p in sorted(memory_dir.rglob("*.md")):
        if p.name == "MEMORY.md":
            continue

        meta = parse_frontmatter(p)
        meta["path"] = str(p.resolve())
        meta["filename"] = p.name
        meta["rel_path"] = str(p.relative_to(memory_dir)).replace("\\", "/")

        comp_keys = meta.get("keys", [])
        primary_key = meta.get("key", "")
        all_keys = list(set(comp_keys + ([primary_key] if primary_key else [])))
        if not all_keys:
            all_keys = [f"ref:{meta['name']}"]

        if is_omni:
            allowed.append(meta)
            continue

        if "omni" in p.parts or any(k.startswith("omni:") for k in all_keys):
            continue

        matched = False
        for req_key in keys:
            for comp_key in all_keys:
                if fnmatch.fnmatch(comp_key, req_key):
                    matched = True
                    break
            if matched:
                break

        if matched:
            allowed.append(meta)

    return allowed


def main():
    # Ensure stdout handles UTF-8 on Windows
    if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    args = sys.argv[1:]
    if not args:
        print("Faust Deterministic Memory Resolver")
        print("Usage: python resolve_memory.py [--json | --bundle] <key1> <key2> ...")
        sys.exit(0)

    as_json = "--json" in args
    as_bundle = "--bundle" in args
    keys = [a for a in args if not a.startswith("--")]

    # 1. Try resident daemon first for 0ms cached speed
    components = query_daemon_resolve(keys)
    source = "DAEMON (Port 20135)"
    if components is None:
        # Fallback offline
        components = resolve_offline(keys, MEMORY_DIR)
        source = "DIRECT DISK"

    if as_json:
        print(json.dumps({"source": source, "keys": keys, "count": len(components), "components": components}, indent=2, ensure_ascii=False))
        return

    if as_bundle:
        print(f"# Faust Resolved Memory Bundle ({source})")
        print(f"*Keys: {', '.join(keys)} | Total Components: {len(components)}*\n")
        for c in components:
            print(f"## {c['name']} (`{c.get('key', 'ref')}`)")
            print(f"Path: `{c['path']}`\n")
            try:
                with open(c['path'], "r", encoding="utf-8", errors="ignore") as f:
                    print(f.read())
            except Exception as e:
                print(f"*Read error: {e}*")
            print("\n---\n")
        return

    print(f"=== Faust Cortex Resolved Memory Components [{source}] ===")
    print(f"Requested Keys: {keys}")
    print(f"Matched Components ({len(components)}):")
    for c in components:
        print(f"  * [{c.get('key', 'ref')}] -> {c['name']} ({c['filename']})")


if __name__ == "__main__":
    from typing import Optional
    main()
