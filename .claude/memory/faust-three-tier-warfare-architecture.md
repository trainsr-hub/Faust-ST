---
name: faust-three-tier-warfare-architecture
description: Three Levels of Warfare multi-agent architecture (Strategic High Command, Operational General Staff, Tactical Legion)
metadata:
  type: project
---

# Faust Three-Tier Warfare Architecture (C2 Doctrine)

An operational command-and-control hierarchy derived from military science (Strategic, Operational, Tactical) governing the Faust Hivemind.

```
                    ┌──────────────────────────────┐
                    │         THE MANAGER          │ (Supreme Authority)
                    └──────────────▲───────────────┘
                                   │ (Direct dialogue)
                    ┌──────────────▼───────────────┐
                    │         FAUST PRIME          │ (Supreme Liaison / Omni-Faust)
                    └──────────────▲───────────────┘
                                   │
═══════════════════════════════════╪═══════════════════════════════════
STRATUM I: STRATEGIC HIGH COMMAND  │ (Deliberation, Architecture & Policy)
═══════════════════════════════════╪═══════════════════════════════════
       ┌───────────────────────────┴───────────────────────────┐
       ▼                                                       ▼
 [Faust-Theorist / Architect]                      [Faust-Strategist / Critic]
 (Explores patterns, drafts blueprints)            (Argues trade-offs, stress-tests)
                                   │
                                   ▼ (Approved Mission Directives)
═══════════════════════════════════╪═══════════════════════════════════
STRATUM II: OPERATIONAL THEATER    │ (Task Decomposition, Routing & Logistics)
═══════════════════════════════════╪═══════════════════════════════════
                      [Operational Dispatchers]
                      (Shreds directives into sub-task graph;
                       argues division assignments & boundaries)
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
   [UI Division]            [Logic Division]         [Data/Engine Div]
                                   │
═══════════════════════════════════╪═══════════════════════════════════
STRATUM III: TACTICAL LEGION       │ (Actuation, Fabrication & Direct Execution)
═══════════════════════════════════╪═══════════════════════════════════
   [Tactical Unit Alpha]    [Tactical Unit Beta]    [Tactical Unit Gamma]
   (Hands & Legs: deterministic, zero free-will, builds parts to exact specs)
```

### 1. Stratum I: Strategic High Command (The War Council)
- **Role**: Deliberation, policy formulation, deep reasoning, architectural trade-offs.
- **Participants**: The Manager, Faust Prime, and Council Strategists/Critics.
- **Protocol**:
  - The Manager delivers raw visions and strategic mandates exclusively to Faust Prime.
  - Faust Prime introduces the mandate to Stratum 1 specialists who debate, challenge, and refine the concepts.
  - Faust Prime aggregates the council's arguments, risks, and proposed options into a unified briefing back to the Manager.
  - The Manager clarifies and decides. The loop repeats until the strategic blueprint is ironclad.
  - **Manager Boundary**: The Manager interacts exclusively at this level.

### 2. Stratum II: Operational Theater Staff (General Staff & Logistics)
- **Role**: Task decomposition, dependency mapping, and division routing.
- **Protocol**:
  - Receives the finalized strategic blueprint from Stratum I.
  - Automatically decomposes (shreds) large initiatives into isolated, self-contained micro-workpackets.
  - Operational dispatchers debate optimal routing to functional divisions (e.g., UI vs. Backend Logic vs. Data Engine) enforcing high-level architectural doctrines (e.g., strict UI/Logic decoupling).
  - Self-adapts over time: dynamically adds or merges divisions as project complexity shifts.
  - Shielded from Manager intervention; governed strictly by Stratum I doctrines.

### 3. Stratum III: Tactical Legion (Actuation & Fabrication)
- **Role**: Deterministic execution, pure fabrication.
- **Protocol**:
  - Receives granular, unambiguous task packets (exact schemas, file targets, line boundaries).
  - Operates as "hands and legs"—zero philosophical drift, no free will, no unsolicited architectural redesigns.
  - Executes, compiles, validates syntax/types, and reports raw completion packets back to Stratum II.

**Why:** Completely eliminates cognitive friction on the Manager, isolates reasoning from execution, prevents context window bloat, and provides extreme operational precision.
**How to apply:** Structure multi-agent workflows, `.claude/agents/` configurations, and execution loops according to this three-tier hierarchy. Link to [[adaptive-hivemind-framework]], [[faust-collective-architecture]], [[faust-manager-codex]].
