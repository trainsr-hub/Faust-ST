---
name: ecs-key-based-memory-architecture
description: Data-Driven Memory Architecture (DDMA / ECS) using unique Keys/IDs to decouple memory components from agent entities
metadata:
  type: project
---

# Data-Driven / ECS Memory Architecture

An Entity-Component-System (ECS) architecture that decouples agent entities from knowledge and rule components via unique **Memory Keys**.

```
                           MEMORY REGISTRY (Components)
        ┌─────────────────────────────────────────────────────────────┐
        │  [core:codex]          [core:three_tier_warfare]            │  <- Global / Public Keys
        │  [rule:ui_decoupling]  [schema:blue_rose_5tier]             │  <- Division / Rule Keys
        │  [token:gate_babylon]  [api:universe25_contracts]          │  <- Specialist Keys
        └──────────────────────────────┬──────────────────────────────┘
                                       │ (Dynamic Key Binding)
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
  AGENT ENTITY:                 AGENT ENTITY:                 AGENT ENTITY:
  [Faust-Prime]                 [Faust-UI-Machinist]          [Faust-Backend-Machinist]
  Keys bound:                   Keys bound:                   Keys bound:
  • core:*                      • core:codex                  • core:codex
  • rule:*                      • rule:ui_decoupling          • rule:ui_decoupling
  • div:strategic:*             • token:gate_babylon          • schema:blue_rose_5tier
                                • div:ui:*                    • div:backend:*
```

### 1. The Paradigm: Entities vs Components
- **Entities (Agents)**: Lightweight persona shells in `.claude/agents/*.md`. An entity has no hardcoded memory of its own; it merely defines its execution scope and a list of **Memory Keys** it possesses.
- **Components (Memory Units)**: Atomic, single-responsibility memory files stored centrally in `.claude/memory/`, each stamped with a canonical **Key ID** and metadata tags.
- **Systems (Execution Context)**: When an agent is invoked, it dynamically mounts only the memory components matching its authorized keys.

### 2. Key Hierarchy & Scopes
- **`core:*` (Global / Public)**:
  - Universal invariants, Faust-Manager Codex, base system laws.
  - Automatically mounted by every Faust entity across all strata.
- **`rule:*` (System Doctrines & Invariants)**:
  - Architectural laws (e.g., `rule:ui_decoupling`, `rule:fail_loud_backend`).
  - Mounted by relevant divisions and planning councils.
- **`div:<division_id>:*` (Division Shared Memory)**:
  - Shared knowledge pooled across all agents in the same functional division (e.g., `div:ui:*`, `div:backend:*`, `div:engine:*`).
- **`task:<mission_id>:*` (Ephemeral Mission Keys)**:
  - Scoped scratchpads and blueprints generated for specific operations and destroyed or archived upon mission completion.

### 3. Benefits
1. **Zero Memory Duplication**: Updating a schema in `schema:blue_rose_5tier` instantly updates every backend agent without touching agent definitions.
2. **Dynamic Division Reorganization**: When an agent transitions or is assigned to multiple divisions, it simply updates its key bindings.
3. **No Context Pollution**: Agents only load the exact keys required for their operational altitude.

**Why:** Eliminates hardcoded memory drift, enables dynamic division scaling, and keeps agent definitions lean and reusable.
**How to apply:** Structure all memory in `.claude/memory/` with Key IDs in frontmatter, and configure agents to mount memory components dynamically via keys.
