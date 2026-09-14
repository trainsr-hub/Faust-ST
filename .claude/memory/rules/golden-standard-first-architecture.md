---
name: golden-standard-first-architecture
description: "Always construct the complete, battle-tested Golden Standard architecture first before tailoring or modifying for bespoke needs."
metadata: 
  node_type: memory
  type: rule
  originSessionId: 0c8cd720-e711-40d3-9142-9dc354aa5258
  modified: 2026-09-14T08:49:08.022Z
---

# Golden Standard First Architecture Invariant

We must always construct and implement systems strictly following the proven, battle-tested **Golden Standard** of the industry first. Only after the complete, canonical Golden Standard is fully functional and verified do we tailor and modify it for our specific needs.

**Why:**
Modifying an incomplete or simplified placeholder architecture leads to brittle systems, technical debt, and architectural drift. Building the true Golden Standard first (e.g., n8n-style multi-branching DAGs, typed ports, topological queue execution, canvas matrix transforms) establishes a solid, proven foundation with zero missing primitives.

**How to apply:**
1. **Model Canonical Golden Standards**: When building a subsystem (e.g. Node Workflow Canvas, Event Bus, SQLite WAL Queue), research and build the full canonical architecture (nodes with multi-output branching, parallel fan-out/fan-in, conditional routing, SVG Bezier connectors).
2. **Verify Before Customizing**: Ensure the baseline canonical system runs cleanly, passes all unit tests, and reproduces the industry benchmark before adding bespoke Faust-specific customizations.
3. **Regular Atomic Commits**: Maintain regular, clean git commits to track architectural milestones and preserve rollback checkpoints.

Links: [[core-architectural-triad]], [[empirical-verification-and-prior-art]], [[faust-three-tier-warfare-architecture]]
