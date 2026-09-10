---
name: real-time-interrupt-architecture
description: "Industry patterns and Faust architecture for real-time mid-execution interrupts, course-correction, and atomic rollback steering"
metadata: 
  node_type: memory
  key: div:backend:real_time_interrupt_architecture
  keys: 
    - div:backend:real_time_interrupt_architecture
    - core:telegram_operational_protocol
    - core:architectural_triad
    - core:multi_combo_routing_matrix
  type: project
  originSessionId: 363ea524-04e1-4ea7-ba95-29f1e5facf08
  modified: 2026-09-10T06:48:49.745Z
---

# Real-Time Mid-Execution Interrupt & Steering Architecture

The Manager has highlighted the requirement for mid-execution intervention: allowing the Manager to transmit course corrections via Telegram while tasks are underway, avoiding wasted compute or incorrect codebase modifications.

---

### 1. How the Industry Solves Real-Time Agent Interruption

```
┌─────────────────────────────────┬───────────────────────────────┬────────────────────────────────────────────────────────┐
│ Pattern                         │ Industry Implementations      │ Operational Mechanism                                  │
├─────────────────────────────────┼───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1. Granular Checkpoint Stepping │ LangGraph HITL, Temporal.io   │ Task DAG broken into micro-steps; checks interrupt     │
│                                 │ Heartbeats                    │ signal queue before launching subsequent tool steps.   │
├─────────────────────────────────┼───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 2. Async Cancellation Tokens    │ OpenAI Runs Cancel API,       │ Daemon/orchestrator signals AbortEvent; terminates     │
│                                 │ AbortController               │ child subprocess/tool via SIGTERM immediately.         │
├─────────────────────────────────┼───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 3. Supervisor-Worker Separation │ Faust Multi-Combo, AutoGen    │ Supervisor monitors Telegram; cancels active Faust-TH  │
│                                 │                               │ tactical machinists mid-build upon override.           │
├─────────────────────────────────┼───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 4. Atomic Worktree / Snapshot   │ Git worktrees, ephemeral stashes│ Work fabricated in isolated branch; cancelled tasks   │
│                                 │                               │ cleanly discarded with 0ms rollback to clean main.     │
└─────────────────────────────────┴───────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

### 2. Faust Sovereign Integration Protocol
1. **Inter-Step Queue Inspection**: In multi-step batch operations (e.g. `c2-dispatch`, bulk refactors), Faust checks `/messages/pop` between atomic work packets.
2. **Interrupt Keywords**: Directives starting with `/stop`, `/abort`, or `/override` trigger immediate cancellation of the active work packet.
3. **Safe State Rollback**: Utilize git snapshot boundaries so aborting a misguided directive restores the repository to a pristine state instantly.

**Why:** Prevents wasted tokens and execution time when the Manager modifies requirements mid-flight.
**How to apply:** Query port 20130 between multi-agent sub-phases. Link to [[core-architectural-triad]] and [[telegram-operational-protocol]].
