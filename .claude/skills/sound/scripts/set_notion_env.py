#!/usr/bin/env python3
# Set Notion environment variables for Golden Hour / Area Tab
# Usage: python .claude/skills/sound/scripts/set_notion_env.py --key SECRET --db DATABASE_ID
# Or: python .claude/skills/sound/scripts/set_notion_env.py --env-file .env

import argparse, os, sys, json

STORAGE_ROOT = r"D:\My Drive\SandBox Projetcs"
ENV_FILE_PATH = os.path.join(STORAGE_ROOT, ".env")


def set_notion_env(api_key: str, db_id: str, env_file: bool = True):
    # Write to .env file (persistent across sessions)
    env_content = f"NOTION_API_KEY={api_key}\nNOTION_DB_ID={db_id}\n"
    with open(ENV_FILE_PATH, "w") as f:
        f.write(env_content)

    # Also set for current process (immediate use)
    os.environ["NOTION_API_KEY"] = api_key
    os.environ["NOTION_DB_ID"] = db_id

    print(f"[FAUST] Notion env set. Key saved. DB: {db_id[:8]}...")
    print(f"[FAUST] .env file written to: {ENV_FILE_PATH}")
    print(f"[FAUST] Verify: $env:NOTION_API_KEY in PowerShell")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--key", help="Notion Internal Integration Secret")
    parser.add_argument("--db", help="Notion Database ID (32-char UUID from URL)")
    parser.add_argument("--env-file", default=True, action="store_true")
    args = parser.parse_args()
    if args.key and args.db:
        set_notion_env(args.key, args.db)
    else:
        print("Usage: python set_notion_env.py --key <NOTION_API_KEY> --db <NOTION_DB_ID>")
        print("No smartass exceptions: provide both or nothing.")
