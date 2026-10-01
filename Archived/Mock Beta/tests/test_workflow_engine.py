#!/usr/bin/env python3
"""
Unit and Integration Tests for Faust Workflow Engine & Renderer (Golden Standard v2)
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
        """Test that the multi-branching telegram workflow matches the JSON schema."""
        is_valid = validate_workflow_schema(self.telegram_workflow, self.schema_path)
        self.assertTrue(is_valid)

    def test_topological_layers_parallel(self):
        """Test that the 13 nodes resolve into ordered parallel layers."""
        engine = FaustWorkflowEngine(self.telegram_workflow)
        layers = engine.get_topological_layers()
        order = engine.get_topological_order()

        self.assertEqual(len(order), 13)
        self.assertIn("telegram_ingress", layers[0])

        # Security gate at layer 1
        self.assertIn("security_gate", layers[1])

        # Security alert and directive classifier in subsequent layers
        layer_nodes_flat = [n for l in layers for n in l]
        self.assertLess(layer_nodes_flat.index("security_gate"), layer_nodes_flat.index("directive_classifier"))
        self.assertLess(layer_nodes_flat.index("directive_classifier"), layer_nodes_flat.index("intake_notify_telegram"))
        self.assertLess(layer_nodes_flat.index("execution_router"), layer_nodes_flat.index("faust_theorist"))
        self.assertLess(layer_nodes_flat.index("faust_theorist"), layer_nodes_flat.index("faust_machinist"))
        self.assertLess(layer_nodes_flat.index("faust_machinist"), layer_nodes_flat.index("debrief_egress_tg"))
        self.assertLess(layer_nodes_flat.index("debrief_egress_tg"), layer_nodes_flat.index("transactional_ack"))

    def test_cycle_detection(self):
        """Test that cyclic dependencies in a DAG raise WorkflowDAGError."""
        cyclic_data = {
            "id": "cyclic_test",
            "name": "Cyclic Test",
            "version": "1.0.0",
            "invariants": {"zero_llm_primacy": True},
            "nodes": [
                {"id": "node_a", "name": "A", "type": "trigger", "execution_mode": "zero_llm", "depends_on": ["node_b"]},
                {"id": "node_b", "name": "B", "type": "trigger", "execution_mode": "zero_llm", "depends_on": ["node_a"]}
            ]
        }
        engine = FaustWorkflowEngine(cyclic_data)
        with self.assertRaises(WorkflowDAGError):
            engine.get_topological_layers()

    def test_missing_dependency_detection(self):
        """Test that references to non-existent nodes raise WorkflowDAGError."""
        invalid_dep_data = {
            "id": "missing_dep_test",
            "name": "Missing Dep Test",
            "version": "1.0.0",
            "invariants": {"zero_llm_primacy": True},
            "nodes": [
                {"id": "node_a", "name": "A", "type": "trigger", "execution_mode": "zero_llm", "depends_on": ["ghost_node"]}
            ]
        }
        engine = FaustWorkflowEngine(invalid_dep_data)
        with self.assertRaises(WorkflowDAGError):
            engine.get_topological_layers()

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
        """Test parallel async dry-run simulation runs all 13 nodes."""
        engine = FaustWorkflowEngine(self.telegram_workflow)
        result = asyncio.run(engine.run_dry_run())
        self.assertEqual(result["status"], "completed")
        self.assertEqual(len(result["execution_order"]), 13)
        self.assertTrue(all(status == "completed" for nid, status in result["node_results"].items() if nid != "security_alert_egress"))


if __name__ == "__main__":
    unittest.main()
