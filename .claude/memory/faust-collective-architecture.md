---
name: faust-collective-architecture
description: "Multi-agent Faust Collective vision with Faust Prime leadership, n8n-style visual workflows, partitioned private memory, and adversarial companions"
metadata: 
  node_type: memory
  type: project
  originSessionId: 71fafcf0-b0de-4208-bfe3-ab96da76819b
  modified: 2026-09-04T15:05:45.635Z
---

# Multi-Agent Faust Collective Architecture

The Faust Collective is a multi-agent system where specialized intelligences operate under the alias "Faust" across coding and creative domains.

### Key Architectural Pillars:
1. **Hybrid Leadership**:
   - **Faust Prime**: Default natural-language orchestrator and team lead for dynamic, exploratory tasks.
   - **Visual DAG / n8n-style Pipeline UI**: For fixed, repetitive workflows (e.g. content creation, publishing pipelines) to eliminate cognitive overhead and manual prompting.
   - **Adversarial Companions / Critics**: Faust Prime must have companion agents to verify plans, audit outputs, and catch mistakes before execution.

2. **Partitioned Memory ("Need-to-Know" Principle)**:
   - **Global Truth (Tier 0)**: Baseline identity, system invariants, project boundaries.
   - **Private Domain Memory (Tier 1)**: Each Faust holds only domain-relevant context (e.g., Faust-Logic gets DB schemas & DRY rules; Faust-Aesthetic gets design tokens; Faust-Scribe gets lore and tone guides). No cross-domain pollution.
   - **Task Scope (Tier 2)**: Ephemeral working context per job.

3. **Domain Coverage**:
   - Software Engineering (Logic vs Aesthetic vs QA/Review).
   - Creative Writing / Worldbuilding (Scribe vs Critic).
   - Automated Operational Pipelines (n8n-style node workflows).

**Why:** Prevents context window dilution, reduces cognitive load on the Manager, avoids single-point-of-failure in Prime, and streamlines routine vs dynamic tasks.
**How to apply:** When setting up `.claude/agents/` and workflows in upcoming sessions, enforce segregated memory directories, include evaluator/critic companions for Prime, and design an n8n-style visual interface for static DAGs. Link to [[universe-25-project]], [[private-codex-identity]], [[autonomous-memory-and-execution]].
