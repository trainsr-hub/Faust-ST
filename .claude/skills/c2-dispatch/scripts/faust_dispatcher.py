#!/usr/bin/env python3
"""
Faust-RD: Deterministic Programmatic Dispatcher (Tier 2.5)
Zero-LLM Cost Code execution pipeline for Blueprint parsing, SHA-256 verification,
and atomic task packet generation for Tier 3 workers (Faust-TH).
"""
import hashlib
import json
import os
import subprocess
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent


@dataclass
class AtomicWorkPacket:
    packet_id: str
    target_file: str
    division: str  # "ui" | "logic" | "data" | "system"
    dependencies: List[str]
    contracts: Dict[str, Any]
    constraints: List[str]
    validation_command: str
    retry_budget: int = 4


@dataclass
class BlueprintValidationResult:
    is_valid: bool
    module_count: int
    calculated_sha: str
    declared_sha: Optional[str]
    errors: List[str]
    packets: List[AtomicWorkPacket]


def compute_blueprint_sha(blueprint_data: Dict[str, Any]) -> str:
    """Compute deterministic SHA-256 hash over blueprint modules and contracts."""
    canonical_bytes = json.dumps(
        {
            "modules": blueprint_data.get("modules", []),
            "contracts": blueprint_data.get("contracts", {}),
            "invariants": blueprint_data.get("invariants", []),
        },
        sort_keys=True,
    ).encode("utf-8")
    return hashlib.sha256(canonical_bytes).hexdigest()


def parse_and_validate_blueprint(blueprint_path: Path) -> BlueprintValidationResult:
    """
    Validate blueprint JSON schema, verify declared module count and SHA-256 checksum.
    Returns structured validation result and generated atomic work packets.
    """
    errors: List[str] = []
    packets: List[AtomicWorkPacket] = []

    if not blueprint_path.exists():
        return BlueprintValidationResult(
            is_valid=False,
            module_count=0,
            calculated_sha="",
            declared_sha=None,
            errors=[f"Blueprint file not found: {blueprint_path}"],
            packets=[],
        )

    try:
        with open(blueprint_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        return BlueprintValidationResult(
            is_valid=False,
            module_count=0,
            calculated_sha="",
            declared_sha=None,
            errors=[f"Invalid JSON in blueprint: {e}"],
            packets=[],
        )

    modules = data.get("modules", [])
    declared_count = data.get("module_count", len(modules))
    declared_sha = data.get("sha256_checksum")

    # Invariant 1: Blueprint Completeness Checksum
    calculated_sha = compute_blueprint_sha(data)
    if declared_sha and declared_sha != calculated_sha:
        errors.append(
            f"SHA-256 Checksum mismatch! Declared: {declared_sha}, Calculated: {calculated_sha}"
        )

    if len(modules) != declared_count:
        errors.append(
            f"Module count mismatch! Declared: {declared_count}, Actual found: {len(modules)}"
        )

    # Validate each module and build atomic work packets
    for idx, mod in enumerate(modules):
        mod_id = mod.get("id", f"packet_{idx:03d}")
        target_file = mod.get("target_file")
        if not target_file:
            errors.append(f"Module {mod_id} is missing 'target_file'.")
            continue

        division = mod.get("division", "logic")
        deps = mod.get("dependencies", [])
        contracts = mod.get("contracts", {})
        constraints = mod.get("constraints", [])
        val_cmd = mod.get("validation_command", "")

        # Default validation command based on file extension
        if not val_cmd:
            if target_file.endswith(".py"):
                val_cmd = f"python -m py_compile {target_file}"
            elif target_file.endswith((".ts", ".tsx")):
                val_cmd = "npx tsc --noEmit"
            elif target_file.endswith((".js", ".jsx")):
                val_cmd = f"node --check {target_file}"

        packet = AtomicWorkPacket(
            packet_id=mod_id,
            target_file=target_file,
            division=division,
            dependencies=deps,
            contracts=contracts,
            constraints=constraints,
            validation_command=val_cmd,
            retry_budget=mod.get("retry_budget", 4),
        )
        packets.append(packet)

    return BlueprintValidationResult(
        is_valid=len(errors) == 0,
        module_count=len(packets),
        calculated_sha=calculated_sha,
        declared_sha=declared_sha,
        errors=errors,
        packets=packets,
    )


def execute_self_healing_compiler_check(
    work_packet: AtomicWorkPacket, cwd: Optional[Path] = None
) -> Tuple[bool, str]:
    """
    Execute Level 3 Execution Verification (Compiler / Diagnostics check).
    Returns (success, stdout/stderr error stream).
    """
    if not work_packet.validation_command:
        return True, "No validation command specified; passed."

    working_dir = cwd or PROJECT_ROOT
    try:
        proc = subprocess.run(
            work_packet.validation_command,
            shell=True,
            cwd=working_dir,
            capture_output=True,
            text=True,
            timeout=60,
        )
        if proc.returncode == 0:
            return True, proc.stdout.strip()
        else:
            error_output = (proc.stderr or proc.stdout).strip()
            return False, error_output
    except subprocess.TimeoutExpired:
        return False, "Validation command timed out after 60 seconds."
    except Exception as e:
        return False, f"Execution failed: {str(e)}"


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Faust-RD Dispatcher (Tier 2.5)")
        print("Usage: python faust_dispatcher.py <path_to_blueprint.json> [--validate-only]")
        sys.exit(0)

    bp_path = Path(sys.argv[1])
    result = parse_and_validate_blueprint(bp_path)

    print(f"=== Faust-RD Blueprint Validation Report ===")
    print(f"Valid: {result.is_valid}")
    print(f"Modules: {result.module_count}")
    print(f"Calculated SHA-256: {result.calculated_sha}")
    if result.declared_sha:
        print(f"Declared SHA-256:   {result.declared_sha}")

    if result.errors:
        print("\n[ERRORS DETECTED]:")
        for err in result.errors:
            print(f"  ❌ {err}")
        sys.exit(1)

    print(f"\n[ATOMIC WORK PACKETS GENERATED]: {len(result.packets)}")
    for p in result.packets:
        print(f"  ⚡ [{p.packet_id}] ({p.division}) -> {p.target_file} | Check: {p.validation_command}")
