---
name: hazard-level-design
key: div:backend:hazard_math
keys:
  - div:backend:hazard_math
  - div:backend:*
  - div:game:golden_hour
  - div:ui:gate_of_babylon
  - core:codex
description: "Hazard Level is a personal odometer (just <a.b>), no rank tiers. Rank tiers are only for collection items. Formula: y = 1.5 * ln(x+1), floor 0."
metadata:
  node_type: memory
  type: project
  originSessionId: 5313ccb3-6f35-4ef6-9d87-013d6a233473
  modified: 2026-09-03T15:14:26.392Z
---

# Hazard Level Design

## Personal Hazard Level (Account Level)
- **Formula**: `y = 1.5 * ln(x + 1)`, where `x` = Golden Hours (derived dynamically as `Universal Time (seconds) / 3600`). If `x < 0`, `y = 0.0`.
- **Display**: Simple decimal `<a.b>` (e.g., `4.7`, `11.3`). No rank title, no tier badge, no label.
- **Practical ceiling**: ~15.0 (represents ~10 years of sustained 6hr/day effort). Not a hard cap, just where human ambition realistically tops out.
- **Philosophy**: A quiet personal odometer. The user sees the number and knows what it cost. No external validation, no "stuck at rank X" frustration.
- **Dynamic Stake**: Linked directly to Universal Time currency balance (`timeBalance / 3600`). Earning time in sub-apps raises your Hazard Level; spending or burning time reduces your Hazard Level in real time, making time preservation feel high-stakes and valuable.

## Rank Tiers (Collection Items Only)
- Rank tiers (✦, ∅, Ψ, S₄–S₁, A+–D, F) apply exclusively to **treasures, relics, and collectibles** obtained from gacha.
- The motivation is to push collection items to the highest rank, not to rank oneself.
- Keeps the dopamine loop on "improve my collection" rather than "improve my label."

## Key Separation
- **Hazard Level** → User → `<a.b>`, no tier
- **Rank Tiers** → Collection items → ranked, tiered, showcased in galleries

**Why:** Avoids the psychological trap of feeling stuck at a named rank. The user competes with their own past effort, not a label. Items get the prestige system; the player stays free.

**How to apply:** When building the Master Game's account display, show Hazard Level as a plain decimal. Never map it to a named tier. Reserve [[gamification-master-game-vision]] rank registries for gacha items and gallery sorting only.
