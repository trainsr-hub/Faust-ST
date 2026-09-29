---
name: anti-spaghetti-architecture
description: "Non-negotiable architectural guardrails enforcing 4-tier separation of concerns, strict file/function limits, early-return guard clauses, immutability, and zero speculative abstractions."
metadata:
  node_type: memory
  type: rule
  key: rule:anti_spaghetti_architecture
  keys:
    - rule:anti_spaghetti_architecture
    - core:architectural_triad
    - rule:golden_standard_first
---

# Anti-Spaghetti Architecture & Clean Modularity Invariant

All software, services, endpoints, and UI interfaces developed across Faust workspaces must strictly adhere to the **4-Tier Clean Architecture** and modularity limits to eliminate god files, deep nesting, and untyped state sprawl.

**Why:**
AI agents tend to accumulate complexity into single monolithic files, use deep arrow-code nesting, and pass untyped mutating dictionaries. Enforcing strict structural boundaries ensures every codebase Faust touches remains maintainable, predictable, and modular for both humans and agents.

**Non-Negotiable Constraints:**
1. **The 4-Tier Separation**:
   - **Tier 1 (Domain)**: Pure schemas and typed models. Zero dependencies on database, network, or UI.
   - **Tier 2 (Repository)**: Raw data persistence (SQLite, filesystem, external I/O). No business logic.
   - **Tier 3 (Service)**: Pure business rules, validation, and domain orchestration.
   - **Tier 4 (Transport / UI)**: Skinny FastAPI routes, CLI commands, or React presentation components (<80 lines).
2. **Hard Modularity Limits**:
   - **File Length**: Maximum **300 lines** (warn at 200). Refactor immediately if exceeded.
   - **Function Length**: Maximum **40 lines**. Single responsibility only.
   - **Indentation Depth**: Maximum **3 levels**. Enforce guard clauses (early returns) to eliminate arrow code.
3. **Type Safety & Immutability**:
   - Type hints on all function signatures.
   - Zero untyped `dict` passing across service layers (use Pydantic / frozen dataclasses / TS interfaces).
   - Functions must return new state; never mutate input parameters in-place.
4. **Karpathy Simplicity Principle (YAGNI)**:
   - Zero speculative generality or single-use abstract wrappers.
   - If 200 lines can be written cleanly in 50 lines, rewrite it.
   - Every line of code must trace directly to the user's directive.
5. **Fresh Verification Gate**:
   - No task is complete without running fresh compiler/test commands (`py_compile`, `pytest`, `tsc`). Zero assumptions.

Links: [[core-architectural-triad]], [[golden-standard-first-architecture]], [[backend-data-persistence]]
