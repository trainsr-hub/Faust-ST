#!/usr/bin/env python3
"""
Unit and Integration Tests for Faust Workflow Engine & Renderer
"""

import asyncio
import json
import unittest
from pathlib import Path
import sys

# Add Mock Beta to path
MOCK_BETA_DIR = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = MOCK_BETA_DIR / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))

from workflow_engine import FaustWorkflowEngine, WorkflowDAGError
from render_workflow import render_markdown, render_mermaid, render_ascii, validate_workflow_schema


class TestFaustWorkflowEngine(unittest.TestCase):

    def setUp(self):
        self.workflow_path = MOCK_BETA_DIR / "workflows" / "telegram_c2_pipeline.json"
        self.schema_path = MOCK_BETA_DIR / "schemas" / "workflow_schema.json"
        with open(self.workflow_path, "r", encoding="utf-8") as f:
            self.telegram_workflow = json.load(f)

    def test_schema_validation(self):
        """Test that the telegram workflow matches the JSON schema."""
        is_valid = validate_workflow_schema(self.telegram_workflow, self.schema_path)
        self.assertTrue(is_valid)

    def test_topological_sort_linear(self):
        """Test that the 8 nodes in the Telegram workflow resolve in proper linear sequence."""
        engine = FaustWorkflowEngine(self.telegram_workflow)
        order = engine.get_topological_order()
        self.assertEqual(len(order), 8)
        self.assertEqual(order[0], "telegram_ingress")
        self.assertEqual(order[1], "security_gate")
        self.assertEqual(order[2], "directive_classifier")
        self.assertEqual(order[3], "intake_notify")
        self.assertEqual(order[4], "execution_router")
        self.assertEqual(order[5], "cognitive_execution")
        self.assertEqual(order[6], "debrief_egress")
        self.assertEqual(order[7], "transactional_ack")

    def test_cycle_detection(self):
        """Test that cyclic dependencies in a DAG raise WorkflowDAGError."""
        cyclic_data = {
            "id": "cyclic_test",
            "name": "Cyclic Test",
            "version": "1.0.0",
            "nodes": [
                {"id": "node_a", "name": "A", "type": "step", "execution_mode": "zero_llm", "depends_on": ["node_b"]},
                {"id": "node_b", "name": "B", "type": "step", "execution_mode": "zero_llm", "depends_on": ["node_a"]}
            ]
        }
        engine = FaustWorkflowEngine(cyclic_data)
        with self.assertRaises(WorkflowDAGError):
            engine.get_topological_order()

    def test_missing_dependency_detection(self):
        """Test that references to non-existent nodes raise WorkflowDAGError."""
        invalid_dep_data = {
            "id": "missing_dep_test",
            "name": "Missing Dep Test",
            "version": "1.0.0",
            "nodes": [
                {"id": "node_a", "name": "A", "type": "step", "execution_mode": "zero_llm", "depends_on": ["ghost_node"]}
            ]
        }
        engine = FaustWorkflowEngine(invalid_dep_data)
        with self.assertRaises(WorkflowDAGError):
            engine.get_topological_order()

    def test_renderer_outputs(self):
        """Test Markdown, Mermaid, and ASCII rendering functions."""
        mermaid_out = render_mermaid(self.telegram_workflow)
        self.assertIn("```mermaid", mermaid_out)
        self.assertIn("telegram_ingress", mermaid_out)
        self.assertIn("-->", mermaid_out)

        md_out = render_markdown(self.telegram_workflow)
        self.assertIn("# Workflow Specification:", md_out)
        self.assertIn("Zero-LLM Primacy", md_out)
        self.assertIn("| Step | Node ID |", md_out)

        ascii_out = render_ascii(self.telegram_workflow)
        self.assertIn("┌── [Workflow:", ascii_out)
        self.assertIn("telegram_ingress", ascii_out)
        self.assertIn("└── [End of Pipeline]", ascii_out)

    def test_dry_run_execution(self):
        """Test async dry-run simulation runs end-to-end."""
        engine = FaustWorkflowEngine(self.telegram_workflow)
        result = asyncio.run(engine.run_dry_run())
        self.assertEqual(result["status"], "completed")
        self.assertEqual(len(result["execution_order"]), 8)
        self.assertTrue(all(status == "completed" for status in result["node_results"].values()))


if __name__ == "__main__":
    unittest.main()
