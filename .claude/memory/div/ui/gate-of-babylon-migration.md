---
name: gate-of-babylon-migration
key: div:ui:vinyl_angel
keys:
  - div:ui:vinyl_angel
  - div:ui:gate_of_babylon
  - div:ui:*
  - core:codex
description: Migrated Gate of Babylon treasure modules into Universe 25 architecture
metadata: 
  node_type: memory
  type: project
  created: 2026-09-03
  originSessionId: ce401df9-05c1-4c6f-8dd0-65d8e17db9dc
  modified: 2026-09-03T09:06:25.708Z
---

**Gate of Babylon Migration to Universe 25**

Successfully migrated two treasury modules from the old "Gate of Babylon" project into [[universe-25-project]]:

## Source Project
- **Path:** `D:\My Drive\Sync\My Obsidian Vaults\Main\GIF\Red_Rose\gate-of-babylon`
- **Architecture:** Dynamic module discovery via Vite `import.meta.glob` — auto-scans `src/treasure/*/index.tsx`
- **Pattern:** Each treasure exports a `TreasuryModule` with manifest + views array
- **Backend:** Same Blue Rose Storage Engine at `http://127.0.0.1:8080/api/v1/execute`

## Migrated Apps

1. **Vinyl Angel** (`vinyl-angel`)
   - Original: Music laboratory pulling from `project_id: "music_app"`
   - Features: Treasury Vault, ETL Pipeline, Hazard Scoring
   - Subname: 天界黑胶 (Celestial Vinyl)

2. **Artifact Codex** (`artifact-codex`)
   - Original: Rank matrix visualizer with 15 hazard tiers (D → ✦)
   - Features: HazardBadge component, Live Score Sandbox, Thematic Registry
   - Subname: 原初典籍 (Primordial Codex)

## Adaptation Strategy
- **Old:** Dynamic glob import discovers modules at runtime
- **New:** Static `APP_REGISTRY` in `useGlobalStore.ts` — manual registration
- **Old:** Multi-view tabs within each treasury (gallery/pipeline/config)
- **New:** Single component per app; sub-views can be internal state
- Both use keep-alive pattern (old via conditional render, new via `display: none`)

## Files Created
- `src/apps/vinyl-angel/VinylAngel.tsx`
- `src/apps/artifact-codex/ArtifactCodex.tsx`
- Updated `APP_REGISTRY` and `AppManager.tsx` to include both

## 4-Tab Vinyl Angel Unification (Completed)
Merged legacy standalone HTMX player (`angel.html`) and treasury vault into a complete 4-tab React Web-OS application:
- **Tab 1 - Gameplay (`VinylPlayer.tsx`)**: YouTube Iframe API playback, weighted roulette sampling ($W = 1 / (\text{played} + 1)$), ratings (`3+` through `7+`, `Pass`, `Spin`, `Block`), Timeblock Arcs (Arc Zero to Arc 04), session progress, Tier 2 JSONL event logging (`project_id: "music_app"`), and Time currency reward (+15s base / +30s on 2x booster).
- **Tab 2 - Shop (`VinylShop.tsx`)**: In-game store to purchase cosmetics (Golden Stylus, Abyssal Needle), boosters (Harmonic Catalyst 2x Time Multiplier), utilities (Chrono Capacitor), and unlockable themes using Time currency.
- **Tab 3 - Gallery (`VinylGallery.tsx`)**: 16-card leaderboard grid with Hazard Badges ($\✦, \emptyset, \Psi, S_1-S_4, A-D$), Danbooru pagination, YouTube modal inspector, and integrated ETL sync action (T2 $\to$ T3 $\to$ T4 with Tier 2 buffer purge).
- **Tab 4 - Config (`VinylConfig.tsx`)**: Local theme switching (Celestial Gold, Obsidian Abyss, Crimson Void, Emerald Sanctuary, Cyberpunk Neon), player autoplay/pass score preferences, and mathematical Hazard scoring formula inspector.
- **Store (`useVinylStore.ts`)**: Zustand store managing local themes, inventory, booster charges, settings, and session stats with persistence.

**Status:** Vinyl Angel 4-tab frontend is fully unified, compiled cleanly with zero TypeScript errors, and operational inside Universe 25.
