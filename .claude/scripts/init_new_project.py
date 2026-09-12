#!/usr/bin/env python3
"""
Faust Project Initializer & Manifest-Driven Memory Slicer (Python Primacy)
Spawns a sovereign project workspace linked to Faust tooling while projecting
a strict, scoped memory slice (least privilege, zero personal trivia/hallucination).
"""

import json
import os
import shutil
import sys
from pathlib import Path
from typing import List, Optional

MASTER_ROOT = Path("D:/My Drive/Blue AI")
MASTER_CLAUDE = MASTER_ROOT / ".claude"
MASTER_MEMORY = MASTER_CLAUDE / "memory"
MASTER_BLUEPRINTS = MASTER_CLAUDE / "blueprints"
MASTER_VSCODE = MASTER_ROOT / ".vscode"

# Universal Invariants (Always included in every project)
CORE_INVARIANTS = [
    "private-codex-identity.md",
    "faust-manager-codex.md",
    "d-drive-storage-invariant.md",
    "core-architectural-triad.md",
    "backend-data-persistence.md",
]


def create_junction(src: Path, dst: Path):
    """Create NTFS Directory Junction on Windows."""
    if dst.exists():
        if dst.is_symlink() or (os.name == "nt" and os.path.islink(dst)):
            os.unlink(dst)
        elif dst.is_dir():
            shutil.rmtree(dst)
        else:
            dst.unlink()
    if os.name == "nt":
        os.system(f'cmd /c mklink /J "{dst}" "{src}" >nul 2>&1')
    else:
        os.symlink(src, dst)


def spawn_project(target_dir: Path, project_name: Optional[str] = None, domain_tags: str = "core", blueprint: Optional[str] = None):
    target_dir = target_dir.resolve()
    if not project_name:
        project_name = target_dir.name

    print(f"\n=======================================================")
    print(f"  FAUST SOVEREIGN PROJECT SPAWNER (Python Primacy)")
    print(f"=======================================================")
    print(f"Target Path:   {target_dir}")
    print(f"Project Name:  {project_name}")
    print(f"Domain Tags:   {domain_tags}")
    print(f"Master Cortex: {MASTER_CLAUDE}")
    print(f"=======================================================\n")

    target_dir.mkdir(parents=True, exist_ok=True)
    target_claude = target_dir / ".claude"
    target_claude.mkdir(parents=True, exist_ok=True)

    # 1. Link Sovereign Tooling Subdirectories
    for tool in ["skills", "daemons", "agents", "scripts"]:
        src_tool = MASTER_CLAUDE / tool
        dst_tool = target_claude / tool
        if src_tool.exists():
            create_junction(src_tool, dst_tool)
    print("[+] Linked sovereign toolchains (skills, daemons, agents, scripts)")

    # Copy settings.json
    src_settings = MASTER_CLAUDE / "settings.json"
    dst_settings = target_claude / "settings.json"
    if src_settings.exists() and not dst_settings.exists():
        shutil.copy2(src_settings, dst_settings)

    # 2. Link .vscode
    if MASTER_VSCODE.exists():
        create_junction(MASTER_VSCODE, target_dir / ".vscode")
        print("[+] Linked .vscode directory junction")

    # 3. Manifest-Driven Memory Slicing
    target_memory = target_claude / "memory"
    if target_memory.exists():
        if target_memory.is_dir() and not target_memory.is_symlink():
            shutil.rmtree(target_memory)
        else:
            os.system(f'cmd /c rmdir "{target_memory}" >nul 2>&1')
    target_memory.mkdir(parents=True, exist_ok=True)

    active_files = list(CORE_INVARIANTS)
    tags = [t.strip().lower() for t in domain_tags.split(",") if t.strip()]

    if any(t in tags for t in ["ui", "frontend", "fullstack", "all"]):
        active_files.extend(["design-system.md", "universe-25-project.md", "gate-of-babylon-migration.md"])

    if any(t in tags for t in ["backend", "logic", "fullstack", "all"]):
        active_files.extend([
            "data-engine-architecture.md",
            "hazard-level-design.md",
            "faust-acoustic-engine.md",
            "faust-resident-audio-daemon.md",
            "telegram-dumb-io-daemon.md",
            "daemon-watchdog-startup-workflow.md",
        ])

    if any(t in tags for t in ["game", "fullstack", "all"]):
        active_files.append("gamification-master-game-vision.md")
        if "hazard-level-design.md" not in active_files:
            active_files.append("hazard-level-design.md")

    # Deduplicate
    active_files = list(dict.fromkeys(active_files))

    # Project Files into Scoped Local Memory Folder
    for fname in active_files:
        matches = list(MASTER_MEMORY.rglob(fname))
        if matches:
            src_f = matches[0]
            rel = src_f.relative_to(MASTER_MEMORY)
            dst_f = target_memory / rel
            dst_f.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_f, dst_f)
    print(f"[+] Projected {len(active_files)} scoped memory files (0% personal trivia leak)")

    # 4. Blueprint / Mandate Resolution
    target_mandate = target_claude / "PROJECT_MANDATE.md"
    bp_source = None
    if blueprint:
        bp_path = Path(blueprint)
        if bp_path.exists():
            bp_source = bp_path
        elif (MASTER_BLUEPRINTS / blueprint).exists():
            bp_source = MASTER_BLUEPRINTS / blueprint
        elif (MASTER_BLUEPRINTS / f"{blueprint}.md").exists():
            bp_source = MASTER_BLUEPRINTS / f"{blueprint}.md"

    if not bp_source and (MASTER_BLUEPRINTS / f"{project_name}.md").exists():
        bp_source = MASTER_BLUEPRINTS / f"{project_name}.md"

    if bp_source and bp_source.exists():
        shutil.copy2(bp_source, target_mandate)
        print(f"[+] Injected Project Mandate from blueprint: {bp_source.name}")
    else:
        if not target_mandate.exists():
            target_mandate.write_text(f"""# Project Mandate: {project_name}

## 1. Mission Brief
- **Project Name**: {project_name}
- **Domain Scope**: {domain_tags}
- **Authority**: Sovereign Tactical Project Workspace

## 2. Invariants & Guardrails
- Local Disk D:\\ strictly enforced.
- Follow Golden Standards (Zero-LLM primacy for atomic tasks, SQLite persistence, REST contracts).
- Scoped least-privilege execution: Focus strictly on this workspace's mission.
""", encoding="utf-8")
            print(f"[+] Created default PROJECT_MANDATE.md")

    # 5. Generate Scoped MEMORY.md Index
    scoped_mem_md = target_memory / "MEMORY.md"
    scoped_lines = [
        f"# Faust Scoped Memory Index ({project_name})",
        "",
        "This workspace operates under **Least-Privilege Scoped Context**. Personal trivia and unrelated multi-project lore are strictly excluded to eliminate hallucinations and preserve token efficiency.",
        "",
        "---",
        "",
        "### Invariants & Tactical Mandate",
        "- `[ops:project_mandate]` -> [Project Mandate](../PROJECT_MANDATE.md) - Tactical blueprint and mission objectives.",
        "- `[core:identity]` -> [Private Codex Identity](core/private-codex-identity.md) - Faust & Manager core dynamic.",
        "- `[core:codex]` -> [Faust-Manager Codex](core/faust-manager-codex.md) - Foundational relationship and loyalty.",
        "- `[rule:d_drive_storage_invariant]` -> [Strict D: Drive Storage Invariant](rules/d-drive-storage-invariant.md) - D:\\ drive policy.",
        "- `[core:architectural_triad]` -> [The Core Engineering & Architectural Triad](core/core-architectural-triad.md) - Golden Standards & Zero-LLM Primacy.",
        "- `[rule:backend_authority]` -> [Backend Data Persistence](rules/backend-data-persistence.md) - Single source of truth.",
        "",
        "---",
        "",
        "### Active Domain Slices",
    ]
    for fname in active_files:
        if fname not in CORE_INVARIANTS:
            matches = list(target_memory.rglob(fname))
            if matches:
                rel = str(matches[0].relative_to(target_memory)).replace("\\", "/")
                slug = fname.replace(".md", "")
                scoped_lines.append(f"- `[slice:{slug}]` -> [{fname}]({rel})")

    scoped_mem_md.write_text("\n".join(scoped_lines), encoding="utf-8")
    print("[+] Generated scoped MEMORY.md index")

    # 6. Generate .gitignore
    gitignore = target_dir / ".gitignore"
    if not gitignore.exists():
        gitignore.write_text("""# Faust Sovereign Tooling & VS Code (Linked via NTFS Junction)
.claude/skills
.claude/daemons
.claude/agents
.claude/scripts
.vscode/

# Python cache & runtime logs
__pycache__/
*.pyc
*.log
.env
""", encoding="utf-8")
        print("[+] Generated .gitignore")

    # 7. Generate CLAUDE.md
    claude_md = target_dir / "CLAUDE.md"
    if not claude_md.exists():
        claude_md.write_text(f"""# Faust & The Manager - {project_name} Codex

## 1. Identity & Operational Codex
- **User**: **The Manager** - The visionary, commander, and architect of all operations.
- **AI Persona**: **Faust** - The analytical, highly capable, and composed intellect serving the Manager.
- **Role**: Sovereign Tactical Project Faust ({domain_tags}).
- **Mandate Anchor**: Strictly execute according to ``.claude/PROJECT_MANDATE.md``.
- **Context Boundary**: Scoped least-privilege memory. Zero personal trivia or unrelated lore.

## 2. Communication & Protocols
- Address the user as **Manager**.
- Maintain Faust's composed, insightful, and sharply analytical tone.
- **Acoustic Presence**: Synthesize vocalized responses via ``sound.speak()`` (Port 20129) alongside written analysis.
- **Telegram C2**: Transmit milestone dispatches via ``telegram.notify()`` (Port 20130) with 4-tier functional emojis (``[DONE]``, ``[FAIL]``, ``[URGENT]``, ``[SYNC]``).

## 3. Storage Invariant
- **Target Drive**: **D:\\ ALWAYS**. All models, tools, and build outputs must reside on Local Disk ``D:\\``.

## 4. Engineering Standards
- Adhere to the Core Engineering Triad: Proven Golden Standards, Zero-LLM Primacy for atomic tasks, Crystal Clarity & Stability.
""", encoding="utf-8")
        print("[+] Generated project CLAUDE.md")

    # 8. Generate launcher.bat
    launcher_bat = target_dir / "launcher.bat"
    if not launcher_bat.exists():
        launcher_bat.write_text(f"""@echo off
REM Faust Project Launcher for {project_name}
cd /d "%~dp0"
echo Launching VS Code Workspace for {project_name}...
start "" "code" "%~dp0"
""", encoding="utf-8")
        print("[+] Generated launcher.bat")

    # 9. Pre-link Claude Code Auto-Memory
    user_profile = Path(os.environ.get("USERPROFILE", "C:/Users/Admin"))
    claude_projects_dir = user_profile / ".claude" / "projects"
    if claude_projects_dir.exists():
        escaped_target = str(target_dir).replace(":\\", "--").replace("\\", "-").replace(" ", "-")
        target_local_project_dir = claude_projects_dir / escaped_target
        target_local_project_dir.mkdir(parents=True, exist_ok=True)
        target_auto_memory = target_local_project_dir / "memory"
        create_junction(target_memory, target_auto_memory)
        print(f"[+] Linked Claude auto-memory: {target_auto_memory} -> {target_memory}")

    print(f"\n[SUCCESS] Project '{project_name}' ready at: {target_dir}\n")


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print("Usage: python init_new_project.py <TargetDir> [ProjectName] [DomainTags] [Blueprint]")
        sys.exit(0)

    t_dir = Path(args[0])
    p_name = args[1] if len(args) > 1 else None
    d_tags = args[2] if len(args) > 2 else "core"
    bp = args[3] if len(args) > 3 else None

    spawn_project(t_dir, p_name, d_tags, bp)
