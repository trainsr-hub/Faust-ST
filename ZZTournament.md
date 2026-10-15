# Tournament Championship Arena — System Codex & Handover

> **Project**: 16-Contender Single-Elimination Mirrored Bracket Arena  
> **Repository**: `trainsr-hub/Faust-ST` | **Branch**: `main` | **Commit**: `2911bb3`  
> **Working Directory**: `D:\My Drive\Blue AI\Z - Mock Test`  
> **Server Endpoint**: `http://127.0.0.1:8088`  
> **Primary References**: `D:\My Drive\Blue AI\Old Stuffs\the.css` & `the.md`  
> **Last Synchronized**: October 15, 2026

---

## 1. Executive Summary & Vision

The Tournament Championship Arena is a fullstack tournament management and visualization system modeled on a split-mirrored 16-fighter bracket. The core user vision is:
1. **Avatar-Centric Focus**: Combatant avatars and crisp tournament connector lines are the paramount visual elements. Distracting particle canvases, heavy rotating glows, and floating labels (`L1..L15`, `M1..M15`) have been deliberately removed.
2. **Single-Crown Victor Invariant**: No separate detached box for the champion. The single crown (`👑`) is mounted directly atop the winning combatant's avatar in the Grand Finals slot (`l15` or `r15`).
3. **Deterministic Orthogonal Connectors**: Bracket lines use pure orthogonal routing (`M a.x a.y H midX V b.y H b.x`) rendered in dynamic SVG over a 100vh-constrained container with `aspect-ratio: 1.31`.
4. **SQLite ACID Persistence**: Complete backing by a normalized SQLite database with foreign keys, WAL mode, transaction safety, and live REST C2 endpoints.

---

## 2. Architecture & File Structure

```
D:\My Drive\Blue AI\
├── Z - Mock Test/
│   ├── run.py                 # Windows background daemon launcher (port 8088)
│   ├── backend/
│   │   ├── domain.py          # Pure Pydantic v2 domain models (Tier 1)
│   │   ├── repository.py      # Raw SQLite queries & schema DDL (Tier 2)
│   │   ├── service.py         # Business rules, tournament logic & simulation (Tier 3)
│   │   ├── server.py          # FastAPI REST endpoints & static mounting (Tier 4)
│   │   └── seed_data.py       # 16 default combatants with verified lore & album vaults
│   ├── data/
│   │   └── tournament.db      # SQLite persistent storage (auto-generated if missing)
│   └── frontend/
│       ├── index.html         # Lean semantic HTML5 arena shell & modals
│       ├── style.css          # Clean MVP CSS (direct port of Old Stuffs/the.css)
│       └── app.js             # Lean client engine (290 lines, SVG routing, scrubber)
└── Old Stuffs/
    ├── the.css                # Golden standard original Obsidian bracket layout
    └── the.md                 # Original Obsidian DataviewJS implementation
```

---

## 3. Database Schema (`data/tournament.db`)

### Table: `participants`
Stores combatant metadata, seed rating, biographical lore, and primary portrait.
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `origin` (TEXT NOT NULL)
- `seed` (INTEGER NOT NULL UNIQUE, 1–16)
- `title` (TEXT)
- `bio` (TEXT)
- `avatar_url` (TEXT NOT NULL)
- `created_at` (TIMESTAMP)

### Table: `participant_albums`
One-to-many child table storing rich lore media, combat art, and gallery vaults.
- `id` (INTEGER PRIMARY KEY)
- `participant_id` (INTEGER NOT NULL, FK -> `participants.id`)
- `image_url` (TEXT NOT NULL)
- `image_type` (TEXT NOT NULL) — e.g. `'portrait'`, `'combat'`, `'lore'`, `'album'`
- `caption` (TEXT)
- `display_order` (INTEGER DEFAULT 0)

### Table: `matches`
Single-elimination progression tracking 15 matches across 4 rounds.
- `id` (INTEGER PRIMARY KEY, 1–15)
- `round` (INTEGER NOT NULL, 1–4)
- `match_number` (INTEGER NOT NULL)
- `participant1_id` (INTEGER, FK -> `participants.id`)
- `participant2_id` (INTEGER, FK -> `participants.id`)
- `winner_id` (INTEGER, FK -> `participants.id`)
- `score1` (INTEGER DEFAULT 0)
- `score2` (INTEGER DEFAULT 0)
- `status` (TEXT NOT NULL) — `'pending'`, `'in_progress'`, `'completed'`
- `next_match_id` (INTEGER, FK -> `matches.id`)
- `next_match_slot` (INTEGER) — `1` (top seed feeder) or `2` (bottom seed feeder)

---

## 4. Bracket Coordinate & Slot Topography

The bracket layout strictly adheres to the coordinates defined in `Old Stuffs/the.css`:

### Bracket Stage Dimensions
- **Container**: `.bracket`
- **Height**: `calc(100vh - 100px)` (leaves ~100px for command bar and scrubber)
- **Width**: `calc((100vh - 100px) * 1.31)`
- **Aspect Ratio**: `1.31`
- **Background**: `#1e293b` slate with textured overlay
- **Avatar Dimension**: `width: 6%`, `aspect-ratio: 1/1`, `border-radius: 8%`

### Left Wing (West)
| Round | Matches | Source Slots | Destination Slot | Coordinates (`left`, `top`) |
| :--- | :--- | :--- | :--- | :--- |
| **R1 (Round of 16)** | Match 1 | `l1`, `l2` | `l9` | `l1`: 2%, 5% \| `l2`: 2%, 16% |
| | Match 2 | `l3`, `l4` | `l10` | `l3`: 2%, 27% \| `l4`: 2%, 38% |
| | Match 3 | `l5`, `l6` | `l11` | `l5`: 2%, 55% \| `l6`: 2%, 66% |
| | Match 4 | `l7`, `l8` | `l12` | `l7`: 2%, 77% \| `l8`: 2%, 88% |
| **R2 (Quarterfinals)** | Match 9 | `l9`, `l10` | `l13` | `l9`: 14%, 10.5% \| `l10`: 14%, 32.5% |
| | Match 10 | `l11`, `l12` | `l14` | `l11`: 14%, 60.5% \| `l12`: 14%, 82.5% |
| **R3 (Semifinals)** | Match 13 | `l13`, `l14` | `l15` | `l13`: 26%, 21.5% \| `l14`: 26%, 71.5% |
| **R4 (Grand Finals West)** | Match 15 | `l15` | **Champion** | `l15`: 40%, 46.5% |

### Right Wing (East)
| Round | Matches | Source Slots | Destination Slot | Coordinates (`right`, `top`) |
| :--- | :--- | :--- | :--- | :--- |
| **R1 (Round of 16)** | Match 5 | `r1`, `r2` | `r9` | `r1`: 2%, 5% \| `r2`: 2%, 16% |
| | Match 6 | `r3`, `r4` | `r10` | `r3`: 2%, 27% \| `r4`: 2%, 38% |
| | Match 7 | `r5`, `r6` | `r11` | `r5`: 2%, 55% \| `r6`: 2%, 66% |
| | Match 8 | `r7`, `r8` | `r12` | `r7`: 2%, 77% \| `r8`: 2%, 88% |
| **R2 (Quarterfinals)** | Match 11 | `r9`, `r10` | `r13` | `r9`: 14%, 10.5% \| `r10`: 14%, 32.5% |
| | Match 12 | `r11`, `r12` | `r14` | `r11`: 14%, 60.5% \| `r12`: 14%, 82.5% |
| **R3 (Semifinals)** | Match 14 | `r13`, `r14` | `r15` | `r13`: 26%, 21.5% \| `r14`: 26%, 71.5% |
| **R4 (Grand Finals East)** | Match 15 | `r15` | **Champion** | `r15`: 40%, 46.5% |

### Grand Finals & Champion
- **Match 15**: `l15` vs `r15`.
- **Winner**: Crowned directly with class `.is-champion` and inner `<div class="crown-badge">👑</div>`. No secondary winner box.

---

## 5. Frontend Client Engine (`frontend/app.js`)

The client code was refactored down to **~290 lines** (adhering to GEMINI.md's 300-line modularity rule):

```javascript
// MATCH_SLOTS dictionary: [p1_slot, p2_slot, winner_slot]
const MATCH_SLOTS = {
  1: ["l1", "l2", "l9"], 2: ["l3", "l4", "l10"], 3: ["l5", "l6", "l11"], 4: ["l7", "l8", "l12"],
  5: ["r1", "r2", "r9"], 6: ["r3", "r4", "r10"], 7: ["r5", "r6", "r11"], 8: ["r7", "r8", "r12"],
  9: ["l9", "l10", "l13"], 10: ["l11", "l12", "l14"], 11: ["r9", "r10", "r13"], 12: ["r11", "r12", "r14"],
  13: ["l13", "l14", "l15"], 14: ["r13", "r14", "r15"], 15: ["l15", "r15", null]
};
```

### Dynamic SVG Orthogonal Routing
SVG lines are prepended into `#bracket-container` via double `requestAnimationFrame`:
```javascript
const path = (a, b, isActive = false) => {
  if (!a || !b) return;
  const midX = (a.x + b.x) / 2;
  const d = `M ${a.x} ${a.y} H ${midX} V ${b.y} H ${b.x}`;
  const p = document.createElementNS(svgNS, "path");
  p.setAttribute("d", d);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", isActive ? "#e2e8f0" : "#64748b");
  p.setAttribute("stroke-width", isActive ? "2.5" : "2");
  p.setAttribute("stroke-opacity", isActive ? "1" : "0.4");
  svg.appendChild(p);
};
```
Active lines light up crisp white (`#e2e8f0`) as fighters advance; pending lines remain subtle slate (`#64748b`).

---

## 6. Backend API Contracts

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tournament` | Returns full tournament state: all 16 participants and 15 match records. |
| `POST` | `/api/matches/{id}/simulate` | Deterministically simulates a single match based on seed weighting & randomness. |
| `POST` | `/api/matches/{id}/score` | Records manual scores (`{match_id, score1, score2}`) and advances victor. |
| `POST` | `/api/tournament/simulate-all`| Auto-simulates all remaining matches to conclusion. |
| `POST` | `/api/tournament/reset` | Resets all matches, advances Round 1 seeds, and resets state in SQLite. |
| `GET` | `/api/participants/{id}` | Fetches contender dossier, biography, and full album vault items. |

---

## 7. Key Lessons & Design Decisions (What to Avoid)

1. **Avoid Over-Styling / Particle Bloat**:
   - The user rejected seasonal particle layers and colorful conic rotating frames.
   - The layout must remain clean, dark, and focused on the combatants' avatars.
2. **Avoid Standalone Champion Box**:
   - Never add a center champion slot. The crown belongs on `l15` or `r15`.
3. **Avoid Floating Round/Match Labels**:
   - Do not re-introduce text badges like `L1`, `R1`, or `Match 1` hovering over slots.
4. **Preserve Modularity & Hard Limits**:
   - Keep backend files < 200 lines (`domain.py`, `repository.py`, `service.py`, `server.py`).
   - Keep frontend `app.js` < 300 lines.
   - Maintain 4-Tier clean separation (Domain -> Repository -> Service -> Transport).

---

## 8. Roadmap & Next Session Directives

When resuming work in a future session, consider these potential pathways:
- **Obsidian / Vault Synchronization**: Bidirectional link between SQLite tournament state and Obsidian Markdown frontmatter (`Hazard_Round_16-1`, etc.).
- **Interactive Manual Scoring**: Enabling Manager to click any active match line to open the score-recording modal directly.
- **Acoustic Combat FX**: Triggering voice announcements or sound effects on match completion via Faust Acoustic Core (`.claude/skills/sound/scripts/cli.py`).
- **Custom Fighter Rosters**: Ability to upload or ingest new fighters and photo albums dynamically into `participants` and `participant_albums`.

---

*Authored by Faust under the direct command of The Manager.*
