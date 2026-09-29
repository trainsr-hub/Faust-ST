---
name: root-cause-analysis
description: Systematic Root-Cause Analysis (RCA) — 5-Whys and diagnostic trace protocol before attempting bugfixes
stratum: Engineering Discipline
tags: [debugging, rca, discipline, stability]
---

# Systematic Root-Cause Analysis (RCA) Protocol

## 1. Core Doctrine
**Never fix symptoms. Eliminate root causes.**
Premature patch-work introduces brittle workarounds, architectural drift, and phantom bugs. When encountering an anomaly, trace the failure upstream through the complete causal chain before modifying any code.

## 2. The 5-Whys Diagnostic Trace

```
  [Observed Defect / Error Log]
               │
               ▼
  1. Why did the process crash or reject? ──► (Direct trigger)
               │
               ▼
  2. Why did the trigger occur? ────────────► (Immediate mechanism)
               │
               ▼
  3. Why was the mechanism allowed? ────────► (Precondition failure)
               │
               ▼
  4. Why was the precondition unmet? ───────► (Missing guard / conflict)
               │
               ▼
  5. Why did the system permit conflict? ───► [Root Cause & Invariant Flaw]
```

## 3. Mandatory Invariants
1. **Evidence-Based Reproduction**: Reproduce the error with deterministic CLI output or logs before proposing changes.
2. **Upstream Isolation**: Inspect call stacks, file descriptors, network ports, and locks. Never mask an error with a `try/except: pass` or broad exception swallowing.
3. **Defense in Depth**: Every RCA fix must include:
   - The architectural prevention at the root level.
   - An early guard clause or assertion at the ingress boundary.
   - A regression test confirming the failure cannot recur.
