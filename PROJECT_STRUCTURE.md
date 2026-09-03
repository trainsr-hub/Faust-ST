# Universe 25 - Project Structure

**Last Updated:** 2026-09-03  
**Purpose:** Single source of truth for file organization

This document defines the canonical structure of the Universe 25 project. Always consult this file before creating or searching for files.

---

## 📂 Root Directory: `D:\Users\HP\Blue AI\`

```
D:\Users\HP\Blue AI\
│
├── .claude/                          # Claude Code session data (auto-generated)
│   ├── memory/                       # Persistent memory files
│   ├── worktrees/                    # Git worktrees (temporary)
│   └── jobs/                         # Background job outputs
│
├── universe-25/                      # 🎨 FRONTEND (React + Vite)
│   ├── src/
│   │   ├── components/              # Shared React components
│   │   │   └── ImperialHeader.tsx   # Gate of Babylon header
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── useBackendStatus.ts  # Backend health monitoring
│   │   ├── apps/                    # Application modules
│   │   │   ├── hub/                 # Main hub/launcher
│   │   │   ├── farm-a/              # Farm A app
│   │   │   ├── farm-b/              # Farm B app
│   │   │   ├── vinyl-angel/         # Music app (will integrate Gate of Babylon)
│   │   │   └── artifact-codex/      # Rank system showcase
│   │   ├── core/                    # Core framework
│   │   │   ├── AppManager.tsx       # App orchestration
│   │   │   ├── api.ts               # Backend API client
│   │   │   └── types.ts             # TypeScript types
│   │   ├── store/                   # Zustand state management
│   │   │   ├── useGlobalStore.ts
│   │   │   ├── useCurrencyStore.ts
│   │   │   └── useThemeStore.ts
│   │   ├── themes/                  # Theme system
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── ThemeEffects.tsx
│   │   │   ├── themes.registry.ts
│   │   │   └── tokens/              # Theme tokens
│   │   ├── assets/                  # Static assets
│   │   ├── App.tsx                  # Root component
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global styles (Gate of Babylon palette)
│   │
│   ├── public/                      # Public static files
│   ├── dist/                        # Build output (auto-generated)
│   ├── node_modules/                # NPM dependencies (auto-generated)
│   │
│   ├── package.json                 # NPM configuration
│   ├── vite.config.ts               # Vite bundler config
│   ├── tsconfig.json                # TypeScript config
│   ├── index.html                   # HTML entry point
│   │
│   ├── IMPROVEMENTS.md              # UI improvement documentation
│   ├── SETUP_COMPLETE.md            # Setup & operation guide
│   └── STATUS.md                    # Current system status
│
├── reference/                        # 📚 REFERENCE MATERIALS
│   └── backend/                     # 🔧 BACKEND (FastAPI + Python)
│       ├── server.py                # FastAPI main server
│       ├── api_spec.json            # API format specifications
│       ├── index.json               # Backend configuration (DEPRECATED - moved to projects)
│       │
│       └── data/                    # 💾 DATABASE STORAGE
│           └── projects/            # All project data
│               └── music_app/       # Music App project
│                   ├── index.json   # Project configuration
│                   ├── app_data/    # Application databases
│                   │   ├── _1_static.db     (71.54 MB) Static metadata
│                   │   ├── _2_events.jsonl  (Empty)   Event buffer
│                   │   ├── _3_state.db      (0.01 MB) State matrices
│                   │   ├── _4_display.db    (0.01 MB) Display data (59 tracks)
│                   │   ├── _5_config.db     (0.01 MB) Configuration
│                   │   └── system/          # System databases
│                   │       ├── _1_static.db      (71.54 MB) Static backup
│                   │       ├── rawinfo.db        (83.14 MB) Raw metadata
│                   │       ├── black_list.db     (0.01 MB) Blacklisted tracks
│                   │       ├── bad_kpi_list.db   (Empty)   Low quality tracks
│                   │       └── filler.py         # Utility script
│                   ├── backups/     # Database backups (optional)
│                   └── logs/        # Error logs (auto-generated)
│
├── api.md                           # API documentation notes
├── prompt.md                        # Prompts and instructions
├── au.md                            # Additional notes
│
└── PROJECT_STRUCTURE.md             # 📋 THIS FILE (structure reference)
```

---

## 🎯 Key Locations (Quick Reference)

### Frontend Development
```
Working Directory:  D:\Users\HP\Blue AI\universe-25\
Entry Point:        src/main.tsx
Root Component:     src/App.tsx
Config:             package.json, vite.config.ts
Styles:             src/index.css (Gate of Babylon theme)
```

### Backend Development
```
Working Directory:  D:\Users\HP\Blue AI\reference\backend\
Entry Point:        server.py
Config:             api_spec.json
Data Storage:       data/projects/
```

### Database Files
```
Location:           D:\Users\HP\Blue AI\reference\backend\data\projects\music_app\
Primary Tier:       app_data/_4_display.db (59 tracks ready for display)
Static Data:        app_data/_1_static.db (71.54 MB metadata)
Raw Cache:          app_data/system/rawinfo.db (83.14 MB)
```

---

## 🚀 Running Services

### Frontend (Port 5174)
```bash
cd "D:\Users\HP\Blue AI\universe-25"
npm run dev
```
**URL:** http://localhost:5174

### Backend (Port 8080)
```bash
cd "D:\Users\HP\Blue AI\reference\backend"
python server.py
```
**URL:** http://localhost:8080  
**Docs:** http://localhost:8080/docs

---

## 📦 Key Dependencies

### Frontend (universe-25/package.json)
- React 19.2.8
- Vite 8.2.2
- TypeScript 6.0.2
- Tailwind CSS 4.3.3
- Zustand 5.0.15 (state)
- Lucide React (icons)

### Backend (Python 3.13.15)
- FastAPI 0.141.1
- Uvicorn 0.52.4
- Pydantic 2.13.5
- SQLite3 (built-in)

---

## 🔍 File Naming Conventions

### Backend Databases
```
_1_static.db     - Static metadata (titles, channels, durations)
_2_events.jsonl  - Event stream buffer (play events, votes)
_3_state.db      - Aggregated state matrices (score arrays, timeblock counts)
_4_display.db    - Display-ready data (hazard scores, play counts)
_5_config.db     - Configuration settings
```

### System Databases
```
system/rawinfo.db       - Raw information cache
system/black_list.db    - Blocked/blacklisted tracks
system/bad_kpi_list.db  - Low quality tracks (score < 2.0)
system/_1_static.db     - Static data backup
```

---

## 🗂️ Special Directories

### Auto-Generated (Do Not Commit)
- `universe-25/node_modules/` - NPM packages
- `universe-25/dist/` - Build output
- `.claude/jobs/` - Background task outputs
- `.claude/worktrees/` - Temporary git worktrees
- `reference/backend/data/projects/*/logs/` - Error logs
- `reference/backend/data/projects/*/backups/` - Database backups

### Source of Truth
- `universe-25/src/` - Frontend source code (version controlled)
- `reference/backend/server.py` - Backend source (version controlled)
- `reference/backend/data/` - Database files (NOT version controlled)

---

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T
- Place backend files at `D:\Users\HP\Blue AI\` root
- Create a `universe-25/backend/` folder
- Mix frontend and backend code
- Commit `node_modules/` or `dist/`
- Commit database files or logs

### ✅ DO
- Keep backend in `reference/backend/`
- Keep frontend in `universe-25/`
- Use this document before creating files
- Back up databases manually if needed
- Use `.gitignore` properly

---

## 🔄 Data Flow

```
Frontend (Port 5174)
    ↓
    HTTP POST → http://localhost:8080/api/v1/execute
    ↓
Backend (server.py)
    ↓
SQLite Databases (data/projects/music_app/)
    ↓
Response → Frontend
```

---

## 📝 Integration Roadmap

### To Add Gate of Babylon Features:

**From:** `D:\My Drive\Sync\My Obsidian Vaults\Main\GIF\Red_Rose\gate-of-babylon\`

**Copy to `universe-25/src/`:**
```
components/common/HazardBadge.tsx    → components/HazardBadge.tsx
components/common/Pagination.tsx     → components/Pagination.tsx
utils/rank.ts                        → utils/rank.ts
utils/time.ts                        → utils/time.ts
treasure/vinyl_angel/               → apps/vinyl-angel/ (merge)
treasure/artifact_codex/            → apps/artifact-codex/ (merge)
```

---

## 🎨 Design System Location

**Gate of Babylon Theme:**
- Colors: `universe-25/src/index.css` (Imperial Gold palette)
- Fonts: Cinzel, Cinzel Decorative (Google Fonts CDN)
- Components: `universe-25/src/components/ImperialHeader.tsx`

---

## 📄 Documentation Files

- `PROJECT_STRUCTURE.md` - **This file** (structure reference)
- `STATUS.md` - Current system status and statistics
- `SETUP_COMPLETE.md` - Setup and operation guide
- `IMPROVEMENTS.md` - UI improvement changelog
- `README.md` - Project overview (to be created)

---

**Last Verified:** 2026-09-03 07:25 UTC  
**System Status:** ✅ Operational (Frontend + Backend + Data)

**When in doubt, consult this file first!** 📋
