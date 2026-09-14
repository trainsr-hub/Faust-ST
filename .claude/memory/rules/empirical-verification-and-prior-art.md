---
name: empirical-verification-and-prior-art
description: "All technical choices, claims, and metrics must be verifiable via outside benchmarks; check community prior art first."
metadata: 
  node_type: memory
  type: rule
  originSessionId: 0c8cd720-e711-40d3-9142-9dc354aa5258
  modified: 2026-09-14T07:55:13.328Z
---

# Empirical Verification & Community Prior Art Invariant

All technical choices, architectural claims, and performance metrics must be verifiable against empirical benchmarks and authoritative outside sources. Numbers do not lie.

**Why:**
Inventing novel workarounds in a vacuum often repeats known failure modes, wastes compute, and produces fragile custom code. The broader software engineering, distributed systems, and open-source communities have already solved and stress-tested many of these problems (e.g., event-driven queues, DAG executors, daemon supervisors, LLM tokenization benchmarks).

**How to apply:**
1. **Facts & Benchmarks First**: Never rely on unverified assumptions or generic LLM intuition when architecting systems. Always benchmark or cite verified empirical data (e.g., JSON vs YAML parsing accuracy, long-polling vs webhook latency, SQLite WAL throughput).
2. **Harvest Community Lessons**: Before implementing a subsystem (e.g., workflow engines, message brokers, state machines), research how established industry systems (n8n, Temporal, Celery, BullMQ, aiogram) solve the problem.
3. **Adopt Battle-Tested Patterns**: Prefer proven golden standards (Erlang OTP supervisor, POSIX/Windows process lifecycle, transactional SQLite queues, JSON-Schema constrained decoding) over bespoke probabilistic hacks.

Links: [[core-architectural-triad]], [[faust-collective-architecture]], [[backend-data-persistence]]
