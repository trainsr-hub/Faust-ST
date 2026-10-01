"""
Entropy Rose: Markdown Converter & Round-Trip Parser for Quote Notes.
Converts O(1) quote metadata and content to clean, human-editable Markdown
(Obsidian-compatible YAML frontmatter + Markdown body) and parses it back to JSON.
"""

import json
import os
import re
import sys
from typing import Dict, Any, List, Union

try:
    import yaml
except ImportError:
    yaml = None


def quote_to_markdown(quote: Dict[str, Any], style: str = "frontmatter") -> str:
    """
    Converts a single quote note and all its metadata into clean Markdown.

    Styles:
      - 'frontmatter' (default): Obsidian-compatible YAML frontmatter + Markdown body.
                                Cleanest for editing and 100% round-trip reliable.
      - 'readable': Markdown bullet list format for quick reading/review.
    """
    if style == "readable":
        return _quote_to_readable_markdown(quote)
    return _quote_to_frontmatter_markdown(quote)


def _quote_to_frontmatter_markdown(quote: Dict[str, Any]) -> str:
    """Converts quote metadata to YAML frontmatter with quote/context in markdown body."""
    # Separate metadata from body content
    metadata = {
        "id": quote.get("id", ""),
        "index": quote.get("index", 1),
        "date": quote.get("date", ""),
        "source_speaker": quote.get("source_speaker", {}),
        "preference": quote.get("preference", []),
        "backlink": quote.get("backlink", []),
        "tags": quote.get("tags", {})
    }

    # Format YAML frontmatter
    if yaml is not None:
        yaml_str = yaml.dump(
            metadata,
            sort_keys=False,
            allow_unicode=True,
            default_flow_style=False
        ).strip()
    else:
        # Fallback if PyYAML unavailable
        yaml_str = json.dumps(metadata, ensure_ascii=False, indent=2)

    main_content = quote.get("main_content", "").strip()
    context = quote.get("context", "").strip()

    md = [
        "---",
        yaml_str,
        "---",
        "",
        "# Quote",
        "",
        main_content,
        "",
        "## Context",
        "",
        context,
        ""
    ]
    return "\n".join(md)


def _quote_to_readable_markdown(quote: Dict[str, Any]) -> str:
    """Converts quote to structured human-readable markdown with bullet points."""
    q_id = quote.get("id", "")
    idx = quote.get("index", "")
    date = quote.get("date", "")
    speaker = quote.get("source_speaker", {})
    name = speaker.get("name", "Unknown")
    role = speaker.get("role", "")
    origin = speaker.get("origin", "")

    speaker_desc = f"{name}"
    if role:
        speaker_desc += f" ({role})"

    preferences = quote.get("preference", [])
    backlinks = quote.get("backlink", [])
    tags = quote.get("tags", {})

    domains = ", ".join(tags.get("domains", []))
    themes = ", ".join(tags.get("themes", []))
    sentiment = tags.get("sentiment", "")
    custom = tags.get("custom", {})
    custom_str = ", ".join(f"{k}={v}" for k, v in custom.items()) if isinstance(custom, dict) else ""

    lines = [
        f"# Quote Note #{idx} [{q_id}]",
        "",
        f"- **Date**: {date}",
        f"- **Speaker**: {speaker_desc}",
        f"  - **Origin**: {origin}" if origin else None,
        f"- **Preference (Responses / Talk-Back)**:" if preferences else "- **Preference**: *(None)*",
    ]
    lines = [l for l in lines if l is not None]

    for p in preferences:
        lines.append(f"  - `{p}`")

    if backlinks:
        lines.append("- **Backlinks**:")
        for b in backlinks:
            lines.append(f"  - Target: `{b.get('target_id')}` | Relation: `{b.get('relation', 'related')}`")
    else:
        lines.append("- **Backlinks**: *(None)*")

    lines.append("- **Tags**:")
    if domains:
        lines.append(f"  - **Domains**: {domains}")
    if themes:
        lines.append(f"  - **Themes**: {themes}")
    if sentiment:
        lines.append(f"  - **Sentiment**: {sentiment}")
    if custom_str:
        lines.append(f"  - **Custom**: {custom_str}")

    lines.extend([
        "",
        "---",
        "",
        "### Quote Content",
        "",
        "> " + quote.get("main_content", "").replace("\n", "\n> "),
        "",
        "### Situational Context",
        "",
        quote.get("context", ""),
        ""
    ])

    return "\n".join(lines)


def quotes_to_markdown(quotes: Union[Dict[str, Any], List[Dict[str, Any]]], style: str = "frontmatter") -> str:
    """Converts a collection of quotes (dict of id->quote or list of quotes) into a single Markdown document."""
    if isinstance(quotes, dict):
        quote_list = list(quotes.values())
    else:
        quote_list = list(quotes)

    # Sort deterministically by index or id
    quote_list.sort(key=lambda q: q.get("index", 0))

    separator = "\n\n" + ("=" * 80) + "\n\n"
    rendered = [quote_to_markdown(q, style=style) for q in quote_list]
    return separator.join(rendered)


def markdown_to_quote(md_text: str) -> Dict[str, Any]:
    """
    Parses a cleaned Markdown quote note back into an Entropy Rose quote dict.
    Handles YAML frontmatter + markdown body sections (# Quote, ## Context).

    Supports both legacy dict format and streamlined list format:
      - source_speaker: ["hexIDs"] or {name, role, origin}
      - preference: ["hexIDs"]
      - backlink: ["url_link"] or [{target_id, relation}]
      - tags: {} or "// empty for now" (normalizes to {})
    """
    frontmatter_match = re.search(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", md_text, re.DOTALL)

    if frontmatter_match and yaml is not None:
        yaml_raw = frontmatter_match.group(1)
        body = frontmatter_match.group(2)

        quote = yaml.safe_load(yaml_raw) or {}

        # Parse body for Quote and Context
        quote_match = re.search(r"#+\s*Quote\s*\n+(.*?)(?=\n+#+\s*Context|\Z)", body, re.DOTALL | re.IGNORECASE)
        context_match = re.search(r"#+\s*Context\s*\n+(.*)", body, re.DOTALL | re.IGNORECASE)

        if quote_match:
            quote["main_content"] = quote_match.group(1).strip()
        elif "main_content" not in quote:
            quote["main_content"] = body.strip()

        if context_match:
            quote["context"] = context_match.group(1).strip()
        elif "context" not in quote:
            quote["context"] = ""

        # Normalize tags: "// empty for now" or string -> {}
        tags = quote.get("tags", {})
        if isinstance(tags, str):
            # Handle "// empty for now" or empty strings
            if not tags or "//" in tags:
                tags = {}
        quote["tags"] = tags

        # Normalize preference: ensure it's a list
        preference = quote.get("preference", [])
        if isinstance(preference, str):
            preference = [preference] if preference else []
        elif not isinstance(preference, list):
            preference = []
        quote["preference"] = preference

        # Normalize backlink: ["url_link"] list format -> [{target_id, relation}] legacy format
        backlink = quote.get("backlink", [])
        if isinstance(backlink, list) and backlink:
            # Check if it's the new streamlined format: list of strings (URLs or IDs)
            if isinstance(backlink[0], str):
                # Convert ["url1", "url2"] -> [{"target_id": "url1", "relation": "references"}, ...]
                converted = []
                for target in backlink:
                    if target.startswith("http://") or target.startswith("https://"):
                        # It's a URL link
                        converted.append({"target_id": target, "relation": "references"})
                    else:
                        # It's a hex ID
                        converted.append({"target_id": target, "relation": "related_to"})
                quote["backlink"] = converted
            # Otherwise assume it's already in legacy format [{target_id, relation}]
        elif not isinstance(backlink, list):
            quote["backlink"] = []

        # Normalize source_speaker: ["hexIDs"] list format -> {name, role, origin} legacy format
        source_speaker = quote.get("source_speaker", {})
        if isinstance(source_speaker, list) and source_speaker:
            # New streamlined format: list of hex IDs
            # Convert to legacy dict format (name will be the ID for now)
            quote["source_speaker"] = {
                "name": source_speaker[0] if source_speaker else "",
                "role": "author",
                "origin": "external"
            }
        elif isinstance(source_speaker, dict):
            # Legacy format - ensure all required fields exist
            if not source_speaker.get("name"):
                source_speaker["name"] = "Unknown"
            quote["source_speaker"] = source_speaker
        else:
            # Unexpected type
            quote["source_speaker"] = {"name": "Unknown", "role": "", "origin": ""}

        return quote

    raise ValueError("Markdown does not contain valid YAML frontmatter delimiters ('---').")


def markdown_to_quotes(md_text: str) -> List[Dict[str, Any]]:
    """
    Parses a multi-quote Markdown document into a list of quote dictionaries.
    Splits by delimiter ('=' * 40+) or multiple frontmatter blocks.
    """
    # Try splitting by equal-sign divider first
    parts = re.split(r"\n={10,}\n", md_text)
    quotes = []

    for part in parts:
        cleaned = part.strip()
        if not cleaned:
            continue
        try:
            q = markdown_to_quote(cleaned)
            if q and q.get("id"):
                quotes.append(q)
        except Exception as e:
            # If not frontmatter or single part, try regex matching all frontmatter blocks
            pass

    if not quotes:
        # Fallback: scan for all '---' blocks in text
        blocks = re.findall(r"(---[\s\S]*?---\s*(?:#+\s*Quote[\s\S]*?)?)(?=(?:\n---|\Z))", md_text)
        for b in blocks:
            try:
                q = markdown_to_quote(b.strip())
                if q and q.get("id"):
                    quotes.append(q)
            except Exception:
                pass

    return quotes


def import_markdown_file_to_system(markdown_path: str) -> int:
    """
    Ingests cleaned Markdown quotes back into the Entropy Rose system:
      1. Updates O(1) hash map: data/quotes.json
      2. Appends to event log: data/quotes.jsonl
      3. Upserts into SQLite: data/rose_quotes.db (FTS5 search index)
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_dir, "data", "quotes.json")
    jsonl_path = os.path.join(base_dir, "data", "quotes.jsonl")

    with open(markdown_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    quotes = markdown_to_quotes(md_text)
    if not quotes:
        raise ValueError(f"No valid quote notes found in Markdown file: {markdown_path}")

    # Load existing hash map
    quotes_map = {}
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                quotes_map = json.load(f)
        except Exception:
            quotes_map = {}

    # Merge cleaned quotes
    for q in quotes:
        quotes_map[q["id"]] = q

    # Write updated JSON hash map
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(quotes_map, f, ensure_ascii=False, indent=2)

    # Append to JSONL event log
    with open(jsonl_path, "a", encoding="utf-8") as f:
        for q in quotes:
            f.write(json.dumps(q, ensure_ascii=False) + "\n")

    # Upsert into SQLite
    try:
        sys.path.insert(0, base_dir)
        import db
        for q in quotes:
            db.upsert_quote(q)
        print(f"[OK] Upserted {len(quotes)} quotes into SQLite rose_quotes.db")
    except Exception as e:
        print(f"[WARN] SQLite synchronization skipped: {e}")

    print(f"[OK] Ingested {len(quotes)} quotes from {markdown_path} into Entropy Rose system.")
    return len(quotes)


def export_all_quotes_to_file(output_path: str = None, style: str = "frontmatter") -> str:
    """Exports all current quotes from data/quotes.json to a markdown file."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_dir, "data", "quotes.json")

    if output_path is None:
        output_path = os.path.join(base_dir, "data", "quotes_export.md")

    if not os.path.exists(json_path):
        raise FileNotFoundError(f"Quotes file not found at: {json_path}")

    with open(json_path, "r", encoding="utf-8") as f:
        quotes = json.load(f)

    md_content = quotes_to_markdown(quotes, style=style)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(md_content)

    print(f"[OK] Exported {len(quotes)} quotes to Markdown at: {output_path}")
    return output_path


if __name__ == "__main__":
    args = sys.argv[1:]
    if "--import" in args:
        idx = args.index("--import")
        target_path = args[idx + 1] if idx + 1 < len(args) else os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "quotes_export.md")
        import_markdown_file_to_system(target_path)
    elif "--readable" in args:
        export_all_quotes_to_file(style="readable")
    else:
        target_path = args[0] if args and not args[0].startswith("--") else None
        export_all_quotes_to_file(target_path, style="frontmatter")
