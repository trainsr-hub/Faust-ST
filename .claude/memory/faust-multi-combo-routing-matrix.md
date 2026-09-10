---
name: faust-multi-combo-routing-matrix
description: 4-Tier Multi-Agent Multi-Combo routing matrix mapping Faust entities to OmniRoute endpoints and mandatory invariants
metadata:
  node_type: memory
  key: core:multi_combo_routing_matrix
  keys:
    - core:multi_combo_routing_matrix
    - core:warfare_c2_doctrine
    - core:monorepo_architecture
  type: project
---

# Faust Multi-Agent Multi-Combo Routing Matrix

This matrix governs the multi-model architecture across OmniRoute (`localhost:20128/v1`), Claude Code CLI, and Faust subagents.

```
┌───────────────┬──────────────┬───────────────────────────────┬────────────────────────┬──────────────────────────────────────────┐
│ Tier          │ Combo ID     │ Underlying Models             │ Routing Strategy       │ Operational Responsibility               │
├───────────────┼──────────────┼───────────────────────────────┼────────────────────────┼──────────────────────────────────────────┤
│ Tier 1        │ Faust-ST     │ Gemini 3.7 Flash (Tiered)     │ Intelligent Auto       │ User Interface, intent parsing, HITL     │
│ Tier 2        │ Faust-ND     │ Sonnet 4.6 (Think) + Flash-Hi │ Priority Queue         │ Strategic Blueprint, Schema & Review     │
│ Tier 2.5      │ Faust-RD     │ Deterministic Script (0-LLM)  │ Deterministic Pipeline │ DAG shredding, SHA Checksum, Dispatch    │
│ Tier 3        │ Faust-TH     │ Qwen3 32B + Llama 3.3 70B     │ Reset-Aware RR         │ Tactical Fabrication & Compiler Loops    │
└───────────────┴──────────────┴───────────────────────────────┴────────────────────────┴──────────────────────────────────────────┘
```

### Agent-to-Combo Mappings
- **Faust Prime / CLI Default**: `Faust-ST` (configured in environment `ANTHROPIC_MODEL`)
- **Stratum I High Command (`faust-theorist`, `faust-critic`)**: `Faust-ND` (mapped via OmniRoute pattern `claude-sonnet*` & `claude-opus*`)
- **Stratum II Operational Dispatcher (`faust-operator`)**: `Faust-RD` (deterministic engine)
- **Stratum III Tactical Machinists (`faust-machinist-ui`, `faust-machinist-logic`)**: `Faust-TH` (mapped via OmniRoute `claude-haiku*` and factory worker pools)

### The 7 Mandatory Invariants
1. **Blueprint Completeness Checksum**: Declared `module_count: N` + SHA-256 hash.
2. **Monotonic Retry Convergence**: Error category tracking halts divergent compiler loops.
3. **Shared Resource Serialization**: Single-writer locks in `Faust-RD` for `types.ts` / shared files.
4. **Anchored Level 2 Review**: Gemini reviews blueprints against static `architecture_invariants.json`.
5. **Numeric Intent Gate**: Confidence score $\ge 0.85$ required before advancing to Tier 2.
6. **Mandatory Escalation Bundle**: Full diagnostic history required on any Tier 3 escalation.
7. **Autonomous Cryptographic Lock**: Full build & integration test suite pass required for auto-merge.

**Why:** Decouples expensive high-altitude reasoning from high-throughput factory execution while preventing silent truncation and model echo chambers.
**How to apply:** All agent invocations and OmniRoute routing configurations must conform to this matrix. Link to [[faust-three-tier-warfare-architecture]], [[ecs-key-based-memory-architecture]].
