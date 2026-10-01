#!/usr/bin/env python3
"""
Faust Workflow Engine - Human-Readable Renderer (Zero-LLM)
Renders AI-Native JSON DAG workflows into Markdown, Mermaid diagrams, and ASCII graphs.
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional


def load_workflow(file_path: Path) -> Dict[str, Any]:
    """Load and parse JSON workflow definition."""
    if not file_path.exists():
        raise FileNotFoundError(f"Workflow file not found: {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def validate_workflow_schema(workflow: Dict[str, Any], schema_path: Optional[Path] = None) -> bool:
    """Validate workflow dictionary against schema if jsonschema is available."""
    if schema_path is None:
        schema_path = Path(__file__).resolve().parent.parent / "schemas" / "workflow_schema.json"

    if not schema_path.exists():
        return True

    try:
        import jsonschema
        with open(schema_path, "r", encoding="utf-8") as sf:
            schema = json.load(sf)
        jsonschema.validate(instance=workflow, schema=schema)
        return True
    except ImportError:
        # Fallback basic validation
        required_fields = ["id", "name", "version", "nodes"]
        for field in required_fields:
            if field not in workflow:
                raise ValueError(f"Missing required top-level field: {field}")
        return True


def render_mermaid(workflow: Dict[str, Any]) -> str:
    """Generate Mermaid.js graph TD syntax with styled zero-llm vs cognitive nodes."""
    lines = ["```mermaid", "graph TD"]
    nodes = workflow.get("nodes", [])
    node_map = {n["id"]: n for n in nodes}

    # Style definitions
    lines.append("    %% Styling Classes")
    lines.append("    classDef zeroLLM fill:#0d2818,stroke:#00b4d8,stroke-width:2px,color:#90e0ef;")
    lines.append("    classDef cognitive fill:#3a0ca3,stroke:#f72585,stroke-width:2px,color:#f8f9fa;")
    lines.append("    classDef filter fill:#1a1a24,stroke:#fca311,stroke-width:2px,color:#ffffff;")

    # Nodes
    for n in nodes:
        node_id = n["id"]
        name = n.get("name", node_id)
        mode = n.get("execution_mode", "zero_llm")
        node_type = n.get("type", "")

        label = f"<b>{name}</b><br/>[{node_type} | {mode}]"
        lines.append(f'    {node_id}["{label}"]')

    # Edges
    for n in nodes:
        node_id = n["id"]
        depends = n.get("depends_on", [])
        for dep in depends:
            if dep in node_map:
                lines.append(f"    {dep} --> {node_id}")

    # Apply Classes
    zero_nodes = [n["id"] for n in nodes if "zero_llm" in n.get("execution_mode", "") or "multicast" in n.get("execution_mode", "")]
    cog_nodes = [n["id"] for n in nodes if "faust" in n.get("execution_mode", "")]
    filter_nodes = [n["id"] for n in nodes if "filter" in n.get("type", "") or "classifier" in n.get("type", "")]

    if zero_nodes:
        lines.append(f"    class {','.join(zero_nodes)} zeroLLM;")
    if cog_nodes:
        lines.append(f"    class {','.join(cog_nodes)} cognitive;")
    if filter_nodes:
        lines.append(f"    class {','.join(filter_nodes)} filter;")

    lines.append("```")
    return "\n".join(lines)


def render_markdown(workflow: Dict[str, Any]) -> str:
    """Generate GitHub-flavored Markdown specification table."""
    wf_id = workflow.get("id", "unknown")
    wf_name = workflow.get("name", "Unnamed Workflow")
    version = workflow.get("version", "0.0.0")
    desc = workflow.get("description", "No description provided.")
    invariants = workflow.get("invariants", {})

    lines = [
        f"# Workflow Specification: {wf_name}",
        f"**ID**: `{wf_id}` | **Version**: `v{version}`",
        f"\n> {desc}\n",
        "## Invariants & Guarantees",
        f"- **Zero-LLM Primacy**: `{'Enabled' if invariants.get('zero_llm_primacy') else 'Disabled'}`",
        f"- **Max Idle Token Burn**: `{invariants.get('max_token_burn_idle', 0)} tokens`",
        f"- **Delivery Guarantee**: `{invariants.get('delivery_guarantee', 'at_least_once')}`",
        "\n## Execution Graph",
        render_mermaid(workflow),
        "\n## Node Directory & Parameters",
        "| Step | Node ID | Type | Mode | Upstream Dependencies | Action / Target | Retry / Failure Policy |",
        "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |",
    ]

    nodes = workflow.get("nodes", [])
    for idx, n in enumerate(nodes, 1):
        node_id = n.get("id", "")
        node_name = n.get("name", node_id)
        node_type = n.get("type", "")
        mode = n.get("execution_mode", "zero_llm")

        # Mode Badge
        if "zero_llm" in mode or "multicast" in mode:
            mode_badge = "`⚡ Zero-LLM`"
        elif "faust" in mode:
            mode_badge = "`🧠 Cognitive`"
        else:
            mode_badge = f"`{mode}`"

        deps = ", ".join(f"`{d}`" for d in n.get("depends_on", [])) or "*Root*"

        target = n.get("target") or n.get("script") or (f"{len(n.get('actions', []))} Multicast Actions" if n.get("actions") else "-")
        if target != "-":
            target = f"`{target}`"

        on_fail = n.get("on_failure") or (f"Max {n['retry_policy']['max_retries']} retries" if "retry_policy" in n else "Abort")

        lines.append(f"| {idx} | **{node_name}** (`{node_id}`) | `{node_type}` | {mode_badge} | {deps} | {target} | {on_fail} |")

    return "\n".join(lines)


def render_ascii(workflow: Dict[str, Any]) -> str:
    """Generate ASCII topological execution tree for terminal output."""
    nodes = workflow.get("nodes", [])
    node_map = {n["id"]: n for n in nodes}

    # Calculate adjacency and in-degrees
    in_degree = {n["id"]: len(n.get("depends_on", [])) for n in nodes}
    children: Dict[str, List[str]] = {n["id"]: [] for n in nodes}
    for n in nodes:
        for dep in n.get("depends_on", []):
            if dep in children:
                children[dep].append(n["id"])

    lines = [
        f"┌── [Workflow: {workflow.get('name', 'DAG')}] (v{workflow.get('version', '1.0.0')})",
        "│"
    ]

    roots = [nid for nid, deg in in_degree.items() if deg == 0]
    visited = set()

    def print_subtree(nid: str, prefix: str = "├── "):
        visited.add(nid)
        node = node_map[nid]
        mode = node.get("execution_mode", "zero_llm")
        mode_tag = "[0-LLM]" if "zero_llm" in mode or "multicast" in mode else "[COGNITIVE]"
        lines.append(f"│  {prefix}{nid} {mode_tag} ({node.get('name')})")
        child_list = children.get(nid, [])
        for i, child in enumerate(child_list):
            is_last = (i == len(child_list) - 1)
            new_prefix = prefix.replace("├── ", "│   ").replace("└── ", "    ") + ("└── " if is_last else "├── ")
            print_subtree(child, new_prefix)

    for root in roots:
        print_subtree(root)

    lines.append("└── [End of Pipeline]")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Faust AI-Native Workflow Renderer (Zero-LLM)")
    parser.add_argument("--workflow", "-w", required=True, help="Path to workflow JSON file")
    parser.add_argument("--format", "-f", choices=["all", "markdown", "mermaid", "ascii"], default="all", help="Output format")
    parser.add_argument("--out", "-o", help="Optional path to write output file")
    parser.add_argument("--validate", action="store_true", help="Validate schema before rendering")

    args = parser.parse_args()
    workflow_path = Path(args.workflow)

    try:
        wf = load_workflow(workflow_path)
        if args.validate:
            validate_workflow_schema(wf)
            print(f"✅ Schema validation passed for {workflow_path.name}")

        output_parts = []
        if args.format in ["all", "ascii"]:
            output_parts.append(render_ascii(wf))
        if args.format in ["all", "markdown"]:
            if output_parts:
                output_parts.append("\n" + "=" * 80 + "\n")
            output_parts.append(render_markdown(wf))
        elif args.format == "mermaid":
            output_parts.append(render_mermaid(wf))

        rendered_text = "\n".join(output_parts)

        if args.out:
            out_path = Path(args.out)
            out_path.parent.mkdir(parents=True, exist_ok=True)
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(rendered_text)
            print(f"✅ Rendered output saved to {out_path}")
        else:
            print(rendered_text)

    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
