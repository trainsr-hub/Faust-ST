---
name: project-architecture
description: Blue AI workspace structure — monorepo layout with universe-25 frontend and reference backend
metadata: 
  node_type: memory
  type: project
  originSessionId: ffe2083a-0419-47af-bb5f-ab1992123631
  modified: 2026-09-03T08:06:41.510Z
---

The workspace root is `D:\Users\HP\Blue AI\` containing two main parts:

## Frontend: `universe-25/`
- **Framework**: React 19 + TypeScript 6 + Vite 8 + Tailwind CSS
- **Entry**: `src/main.tsx` → `src/App.tsx`
- **Design System**: "Gate of Babylon" — Imperial Gold palette, Cinzel typography
- **Apps** (keep-alive mounted, toggled via `.app-visible`/`.app-hidden`):
  - `src/apps/vinyl-angel/` — Music laboratory (Treasury Vault gallery, ETL Pipeline, Destiny Config)
  - `src/apps/artifact-codex/` — Rank matrix showcase, live score sandbox, procedural VFX shaders
  - Hub (main navigation)
- **Key shared components**:
  - `src/components/HazardBadge.tsx` — 15-tier rank badge with procedural SVG underlays (Ψ waves, Ø black hole, ✦ star)
  - `src/components/Pagination.tsx` — Danbooru-style pagination
  - `src/components/ImperialHeader.tsx` — Header with backend status indicator
- **Key utils**:
  - `src/utils/rank.ts` — 15-tier rank definitions, thresholds, `getRankFromScore()`
  - `src/utils/time.ts` — `formatDuration()` for mm:ss / hh:mm:ss
- **Services**:
  - `src/services/api.ts` — Unified client calling `http://localhost:8080/api/v1/execute`
  - `src/hooks/useBackendStatus.ts` — Health check polling `/openapi.json`
- **CSS**: `src/index.css` — All keyframe animations for badge VFX shaders
- **Build**: `npm run build` → `tsc -b && vite build`

## Backend: `reference/backend/`
- **Framework**: Python FastAPI
- **Entry**: `server.py`
- **Port**: 8080
- **Data**: `data/projects/music_app/app_data/` — SQLite databases
- **API**: Single endpoint `POST /api/v1/execute` with `{ project_id, tier, order: { action, data } }`

See [[data-engine-architecture]] for the 5-tier data model.
See [[design-system]] for visual specifications.
