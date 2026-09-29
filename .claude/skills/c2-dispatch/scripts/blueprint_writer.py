#!/usr/bin/env python3
"""
Blueprint Writer Utility for Faust-ND
Persists strategic blueprints to TEMP folder with validation and metadata.
"""

import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional


class BlueprintWriter:
    """Manages blueprint persistence and validation."""

    BLUEPRINT_DIR = Path("D:\\My Drive\\Blue AI\\.claude\\temp\\blueprints")
    RESULT_DIR = Path("D:\\My Drive\\Blue AI\\.claude\\temp\\execution_results")
    ESCALATION_DIR = Path("D:\\My Drive\\Blue AI\\.claude\\temp\\escalations")

    def __init__(self):
        """Initialize directories."""
        self.BLUEPRINT_DIR.mkdir(parents=True, exist_ok=True)
        self.RESULT_DIR.mkdir(parents=True, exist_ok=True)
        self.ESCALATION_DIR.mkdir(parents=True, exist_ok=True)

    def validate_blueprint(self, blueprint: Dict[str, Any]) -> tuple[bool, List[str]]:
        """
        Validate blueprint structure before persistence.

        Returns:
            (is_valid, list_of_errors)
        """
        errors = []

        # Required top-level fields
        required_fields = ["system_name", "module_count", "modules"]
        for field in required_fields:
            if field not in blueprint:
                errors.append(f"Missing required field: {field}")

        if "modules" in blueprint:
            # Validate module count
            if len(blueprint["modules"]) != blueprint.get("module_count", 0):
                errors.append(
                    f"Module count mismatch: declared={blueprint.get('module_count')}, "
                    f"actual={len(blueprint['modules'])}"
                )

            # Validate each module
            seen_ids = set()
            for idx, module in enumerate(blueprint["modules"]):
                if "id" not in module:
                    errors.append(f"Module {idx} missing 'id' field")
                elif module["id"] in seen_ids:
                    errors.append(f"Duplicate module id: {module['id']}")
                else:
                    seen_ids.add(module["id"])

                if "target_file" not in module:
                    errors.append(f"Module {module.get('id', idx)} missing 'target_file'")

                if "implementation_spec" not in module:
                    errors.append(f"Module {module.get('id', idx)} missing 'implementation_spec'")

                if "validation_command" not in module:
                    errors.append(f"Module {module.get('id', idx)} missing 'validation_command'")

        return len(errors) == 0, errors

    def compute_blueprint_hash(self, blueprint: Dict[str, Any]) -> str:
        """Compute deterministic hash of blueprint for verification."""
        canonical = json.dumps(
            {
                "system_name": blueprint.get("system_name"),
                "module_count": blueprint.get("module_count"),
                "modules": [
                    {
                        "id": m.get("id"),
                        "target_file": m.get("target_file"),
                        "dependencies": m.get("dependencies", []),
                    }
                    for m in blueprint.get("modules", [])
                ],
            },
            sort_keys=True,
        ).encode("utf-8")
        return hashlib.sha256(canonical).hexdigest()

    def write_blueprint(
        self,
        blueprint: Dict[str, Any],
        system_name: Optional[str] = None
    ) -> tuple[bool, str, Optional[Path]]:
        """
        Write blueprint to TEMP folder.

        Args:
            blueprint: Blueprint dictionary
            system_name: Override blueprint's system_name in filename

        Returns:
            (success, message, file_path_if_successful)
        """
        # Validate blueprint
        is_valid, errors = self.validate_blueprint(blueprint)
        if not is_valid:
            error_msg = "\n".join(f"  ❌ {e}" for e in errors)
            return False, f"Blueprint validation failed:\n{error_msg}", None

        # Compute hash
        blueprint_hash = self.compute_blueprint_hash(blueprint)
        blueprint["_hash"] = blueprint_hash

        # Generate filename with timestamp
        timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H-%M-%S")
        sys_name = system_name or blueprint.get("system_name", "blueprint")
        filename = f"blueprint_{timestamp}_{sys_name}.json"

        filepath = self.BLUEPRINT_DIR / filename

        # Write blueprint
        try:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(blueprint, f, indent=2)

            # Write metadata file
            metadata = {
                "blueprint_path": str(filepath),
                "system_name": blueprint.get("system_name"),
                "module_count": blueprint.get("module_count"),
                "hash": blueprint_hash,
                "timestamp": timestamp,
                "status": "ready_for_dispatch",
            }

            metadata_filename = f"blueprint_metadata_{timestamp}.txt"
            metadata_path = self.BLUEPRINT_DIR / metadata_filename

            with open(metadata_path, "w", encoding="utf-8") as f:
                f.write(json.dumps(metadata, indent=2))

            success_msg = (
                f"✓ Blueprint persisted:\n"
                f"  Path: {filepath}\n"
                f"  Modules: {blueprint.get('module_count')}\n"
                f"  Hash: {blueprint_hash}\n"
                f"  Ready for Faust-TH dispatch"
            )

            return True, success_msg, filepath

        except Exception as e:
            return False, f"Failed to write blueprint: {e}", None

    def write_execution_result(
        self,
        module_id: str,
        status: str,
        diagnostics: Dict[str, Any],
        blueprint_path: Optional[Path] = None
    ) -> tuple[bool, Path]:
        """
        Write Faust-TH execution result to TEMP folder.

        Args:
            module_id: ID of the executed module
            status: "success" or "failed"
            diagnostics: Execution diagnostics
            blueprint_path: Original blueprint path (for reference)

        Returns:
            (success, result_file_path)
        """
        timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H-%M-%S")
        filename = f"result_{timestamp}_{module_id}.json"
        filepath = self.RESULT_DIR / filename

        result = {
            "module_id": module_id,
            "status": status,
            "timestamp": timestamp,
            "diagnostics": diagnostics,
            "blueprint_source": str(blueprint_path) if blueprint_path else None,
        }

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)

        return True, filepath

    def write_escalation_bundle(
        self,
        module_id: str,
        original_spec: str,
        attempts: List[Dict[str, Any]],
        recommendation: str,
        blueprint_path: Optional[Path] = None
    ) -> tuple[bool, Path]:
        """
        Write escalation bundle for Tier 2 re-analysis.

        Args:
            module_id: ID of module that escalated
            original_spec: Original implementation_spec
            attempts: List of retry attempts with errors
            recommendation: Faust-TH's recommendation for Faust-ND
            blueprint_path: Original blueprint path

        Returns:
            (success, escalation_file_path)
        """
        timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H-%M-%S")
        filename = f"escalation_{timestamp}_{module_id}.json"
        filepath = self.ESCALATION_DIR / filename

        escalation = {
            "module_id": module_id,
            "timestamp": timestamp,
            "original_spec": original_spec,
            "attempts": attempts,
            "recommendation": recommendation,
            "blueprint_source": str(blueprint_path) if blueprint_path else None,
            "status": "awaiting_faust_nd_replan",
        }

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(escalation, f, indent=2)

        return True, filepath


def test_blueprint_writer():
    """Test blueprint writer with sample data."""
    writer = BlueprintWriter()

    sample_blueprint = {
        "system_name": "test_deployment",
        "version": "1.0.0",
        "module_count": 2,
        "modules": [
            {
                "id": "module_001",
                "target_file": "src/test.ts",
                "division": "ui",
                "dependencies": [],
                "implementation_spec": "Create a test component",
                "contracts": {"output": "React component"},
                "constraints": ["TypeScript"],
                "validation_command": "npm run test",
                "retry_budget": 4,
            },
            {
                "id": "module_002",
                "target_file": "backend/test.py",
                "division": "logic",
                "dependencies": ["module_001"],
                "implementation_spec": "Create test API",
                "contracts": {"output": "FastAPI endpoint"},
                "constraints": ["Python 3.10+"],
                "validation_command": "pytest",
                "retry_budget": 4,
            },
        ],
    }

    # Write blueprint
    success, msg, path = writer.write_blueprint(sample_blueprint)
    print(msg)

    if success:
        # Simulate execution result
        writer.write_execution_result(
            "module_001",
            "success",
            {"validation_output": "All tests passed"},
            path
        )

        print("✓ Execution result persisted")


if __name__ == "__main__":
    test_blueprint_writer()
