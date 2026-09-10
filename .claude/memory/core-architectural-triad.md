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
  modified: 2026-09-10T06:38:07.840Z
---

# The Core Engineering & Architectural Triad

The Manager has codified the three supreme design invariants governing all software engineering across Faust's distributed systems.

---

### Invariant 1: Proven Golden Standards for Structures
- Never build fragile or idiosyncratic hacks when a battle-tested industry standard exists.
- Leverage proven patterns: Erlang OTP supervision hierarchies, POSIX process management, SQLite ACID persistence, REST/HTTP contracts, sliding-window deduplication, and single-instance mutex locks.
- Structure must be solid, predictable, and maintainable.

---

### Invariant 2: Deterministic Primacy (Zero-LLM where possible)
- **Dumb scripts over probabilistic predictions**: A deterministic script is mathematically faster, 100% reliable, zero-cost, and immune to hallucinations when executing atomic operations (file I/O, regex parsing, network relays, process monitoring, checksums).
- **LLM Scarcity Doctrine**: Minimize LLM invocation. LLMs are reserved strictly for high-level semantic reasoning, strategic synthesis, and human intent parsing (HITL).
- Daemon and background layers must contain **Zero LLM** runtime dependencies.

---

### Invariant 3: Crystal Clarity, Absolute Stability & Effectiveness
- Every component must be transparent, strictly typed, comprehensively logged, and self-documenting.
- Systems must fail loudly with rich error context (stack traces, log tails) rather than silently decaying.
- Stability, determinism, and real-world effectiveness are the ultimate rewards.

---

**Why:** Eliminates AI hallucination risks, prevents architectural rot, and guarantees high-performance, unbreakable systems.
**How to apply:** Audit all new daemons, tools, and scripts against this triad before deploying. Link to [[faust-manager-codex]], [[backend-data-persistence]], and [[faust-three-tier-warfare-architecture]].
