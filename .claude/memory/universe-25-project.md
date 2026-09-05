---
name: universe-25-project
key: div:ui:universe25
keys:
  - div:ui:universe25
  - div:ui:*
  - core:codex
description: "Universe 25 - Web-OS with plugin-based architecture, Time currency, soft-coded theming, authoritative Blue Rose backend storage"
metadata: 
  node_type: memory
  type: project
  created: 2026-09-03
  originSessionId: ce401df9-05c1-4c6f-8dd0-65d8e17db9dc
  modified: 2026-09-03T16:15:58.616Z
---

**Universe 25** is a plugin-based Web-OS running multiple lightweight apps and games within a single localhost instance, powered by the authoritative Blue Rose FastAPI storage engine.

**Architecture:**
- **Keep-alive navigation**: All apps render simultaneously, toggled via CSS `display: none/block`. Components never unmount → zero re-render cost, perfect state preservation (scroll, timers, audio playback, local state).
- **No React Router**: Navigation controlled by Zustand `activeApp` state. LocalStorage is strictly reserved for transient UI navigation state.
- `AppManager.tsx` renders all registered apps. Adding a new app = drop folder in `src/apps/`, register in `APP_REGISTRY`.

**Tech Stack:**
- React + Vite + TypeScript
- Zustand + custom synchronization engine (`src/core/syncEngine.ts`)
- Tailwind CSS v4 (CSS-first config via custom properties) + Lucide Icons
- Backend: Blue Rose Storage Engine (FastAPI, runs on `http://localhost:8080` located at `D:\Users\HP\Blue AI\backend`)

**Authoritative Backend Integration (`D:\Users\HP\Blue AI\backend`):**
- Single execution gateway: `POST /api/v1/execute`
- Request shape: `{ project_id: "universe_25", tier: string, order: { action, key?, data? } }`
- **5 Storage Tiers (`data/projects/universe_25/app_data/`)**:
  1. `state.json` (JSON): Universal Time balance, user profile.
  2. `inventory.json` (JSON): Dimensional proof-of-effort roll tickets (`angelRollTickets`, `solarRollTickets`, `codexRollTickets`), Discs, Solar Essence, Codex Fragments.
  3. `vault.json` (JSON): Relics, Babylonian Altar equipment loadouts (4 slots), IoT Energy Reserves (Solar, Void, Verdant, Celestial, Aether).
  4. `farms.json` (JSON): Agrarian plot states for Farm Alpha and Farm Beta.
  5. `events.jsonl` (JSONL): Transactional audit ledger.
- **Fail-Loudly Policy**: No silent fallbacks. Critical offline alert banner in `ImperialHeader.tsx` renders if backend storage engine is offline.

**Currency & Master Game Loop:**
- **Universal Currency**: **Time** (seconds) acts as **Golden Hours** ($x = \text{timeBalance} / 3600$).
- **Personal Hazard Level Odometer**: $y = 1.5 \cdot \ln(x + 1)$ ($x \ge 0$) rendered as an unranked decimal odometer $\langle a.b \rangle$.
- **Sub-Games (Origin Worlds)**: Produce local effort currencies to purchase Dimensional Tickets in local shops; tickets are exported to Golden Hour for summoning.

**Registered Apps (`APP_REGISTRY`):**
1. **Hub (`hub`)** - Navigation dashboard, currency display, theme switcher
2. **Golden Hour (`golden-hour`)** - Master Game: Dynamic Hazard Level Odometer, Tab 1 Tactical Battle Arena (Phase 1 Locked), Tab 2 Dimensional Summoning Altar, Tab 3 Purpose-Driven Vault, Tab 4 Dev Sandbox & Storage Blueprint Inspector
3. **Farm Alpha (`farm-a`)** - 6 wheat plots, 60s plant cost → 30s harvest yield, syncs to `farms.json`
4. **Farm Beta (`farm-b`)** - 4 sunflower plots, 180s plant cost → 120s harvest yield, syncs to `farms.json`
5. **Vinyl Angel (`vinyl-angel`)** - Autonomous Music Laboratory, Discs currency, Angel Roll Tickets shop
6. **Artifact Codex (`artifact-codex`)** - Hazard Matrix & Rank Visualizer, Codex Roll Tickets

**Related Memories:**
- [[gamification-master-game-vision]]
- [[hazard-level-design]]
- [[backend-data-persistence]]
- [[gate-of-babylon-migration]]
- [[autonomous-memory-and-execution]]
- [[private-codex-identity]]
