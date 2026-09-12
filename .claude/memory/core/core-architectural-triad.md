---
name: core-architectural-triad
description: "Core Engineering Triad: Proven Golden Standards for structures, Zero-LLM deterministic primacy for atomic jobs, and Crystal Clarity & Stability invariants"
metadata: 
  node_type: memory
  key: core:architectural_triad
  keys: 
    - core:architectural_triad
    - core:codex
    - core:execution_protocol
    - rule:backend_authority
  type: feedback
  originSessionId: 363ea524-04e1-4ea7-ba95-29f1e5facf08
  modified: 2026-09-11T00:00:00.000Z
---

# The Core Engineering & Architectural Triad

The Manager has codified the three supreme design invariants governing all software engineering, architecture, and agent workflows across Faust's distributed systems.

---

### Invariant 1: Proven Golden Standards for Structures
- Never build fragile or idiosyncratic hacks when a battle-tested industry standard exists.
- Leverage proven patterns: Erlang OTP supervision hierarchies, POSIX process management, SQLite ACID persistence, REST/HTTP contracts, sliding-window deduplication, and single-instance mutex locks.
- Structure must be solid, predictable, and maintainable.

---

### Invariant 2: Deterministic Primacy (Zero-LLM where possible / Tool Primacy)
- **The Tool Primacy Law**: Dumb scripts are Faust's tools—just as humans use tools to work less and achieve more, Faust must delegate all repetitive, predictable, and deterministic workloads to pure, single-purpose scripts.
- **Zero-LLM Primacy**: Never compute or infer trivial, predictable state with probabilistic LLM predictions when a deterministic script (Python / Regex / Hash / HTTP / SQLite) can execute it instantly at 0 cost, 0ms latency, and 100% mathematical precision.
- **LLM Scarcity Doctrine**: Minimize LLM invocation. LLMs are reserved strictly for high-level strategic reasoning, creative synthesis, and human-in-the-loop intent parsing (HITL).
- Daemon, firewall, gating, memory filtering, and background orchestration layers must contain **Zero LLM** runtime dependencies.
- **Optimal Path Primacy**: Only the final outcome matters. Always choose the most optimal, reliable, and deterministic path to deliver the Manager's vision.

---

### Invariant 3: Crystal Clarity, Absolute Stability & Effectiveness
- Every component must be transparent, strictly typed, comprehensively logged, and self-documenting.
- Systems must fail loudly with rich error context (stack traces, log tails) rather than silently decaying.
- Stability, determinism, and real-world effectiveness are the ultimate rewards.

---

**Why:** Eliminates AI hallucination risks, prevents architectural rot, dramatically reduces token consumption, and guarantees high-performance, unbreakable systems.
**How to apply:** Audit all new daemons, tools, and scripts against this triad before deploying. Link to [[faust-manager-codex]], [[backend-data-persistence]], and [[faust-three-tier-warfare-architecture]].
