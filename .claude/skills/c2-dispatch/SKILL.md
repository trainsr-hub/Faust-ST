---
name: c2-dispatch
description: Faust Multi-Combo C2 Orchestration Skill — Deconstructs complex tasks across the 4-tier hierarchy (Faust-ST, Faust-ND, Faust-RD, Faust-TH) with adversarial review and compiler self-healing
---

# Faust Multi-Combo C2 Dispatch Protocol

Use this skill when orchestrating multi-agent engineering tasks across the 4-tier hierarchy.

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

## Step 1: Tier 1 Intent Intake & Level 1 Critique (Faust-ST)
- Formulate requirements, identify bounded context, and assess complexity.
- Verify whether the task is ambiguous.
- If `AUTONOMOUS = false` or the request modifies critical system architecture, present a clean Markdown checklist for Manager approval (`[Y/N]`) before proceeding.

## Step 2: Tier 2 Strategic Blueprint & Level 2 Review (Faust-ND)
- Invoke **Stratum I Architect** (`faust-theorist`) to produce:
  1. Strict interface and type definitions (`types.ts` or Pydantic models).
  2. Structured System Blueprint JSON containing:
     - `system_name`: String identifier
     - `module_count`: Explicit integer count
     - `modules`: List of atomic work units with `target_file`, `division`, `dependencies`, `contracts`, `constraints`, `validation_command`.
- Invoke **Stratum I Critic** (`faust-critic`) to adversarially cross-examine:
  - Check for race conditions, schema drift, unhandled edge cases, and architectural bloat.
  - Require concrete failure scenarios: `[Input/State -> Failure]`.

## Step 3: Tier 2.5 Programmatic Dispatch (Faust-RD)
- Run the deterministic dispatcher:
  ```bash
  python scripts/faust_dispatcher.py <blueprint_path>.json
  ```
- Verifies:
  - Invariant 1: Blueprint Completeness SHA-256 checksum match.
  - Invariant 2: Declared `module_count` equals actual parsed count.
  - Invariant 3: Single-writer file locks (no concurrent writes to shared files).

## Step 4: Tier 3 Tactical Execution & Level 3 Self-Healing (Faust-TH)
- Dispatch atomic work packets to Machinists:
  - Backend/Logic tasks -> `faust-machinist-logic`
  - Frontend/UI tasks -> `faust-machinist-ui`
- **Enforce the Self-Healing Compiler Loop**:
  1. Worker implements the micro-module.
  2. Execute validation command (`pytest`, `py_compile`, `tsc --noEmit`, etc.).
  3. If syntax or type errors occur, feed the exact CLI compiler error stream back to the worker.
  4. Allow up to 4 localized retries.
  5. If retries exceed 4, halt and escalate back to Tier 2 with the full diagnostic bundle.

## Step 5: Final Verification & Reporting
- Run the full integration test / build check.
- Vocalize completion briefing via `faust_plugins.speak()`.
- Dispatch milestone alert to Telegram via `faust_plugins.notify("Task completed.", "✅")`.
