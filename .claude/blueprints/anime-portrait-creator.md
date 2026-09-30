# Tactical Architecture Blueprint: Anime Portrait Creator

## 1. Executive Summary & Strategic Intent
- **Project Name**: Anime Portrait Creator
- **Target Path**: `D:\My Drive\Anime Portrait Creator`
- **Domain Tags**: `[ui, game]`
- **Author**: Omniscient Faust (High Command / Main_03)
- **Status**: Draft

### Mission Statement
A standalone 2D anime portrait creator where users assemble character faces by selecting modular SVG parts (eyes, eyebrows, mouth, hair, skin tone) and applying live recoloring. Built as a sovereign cloned project from Wardrobe Studio's proven patterns, with a data-driven SVG parts registry, local JSON persistence, and a clean component architecture that can later evolve into full-body and wardrobe integration.

---

## 2. Architectural Golden Standards & Invariants
- **Storage Policy**: Local Disk `D:\` strictly enforced (`D:\My Drive\Anime Portrait Creator\...`).
- **Core Engineering Triad**:
  1. Proven Golden Standards (POSIX / SVG DOM / Standard REST contracts).
  2. Zero-LLM Primacy for deterministic atomic routines.
  3. Crystal Clarity & Absolute Stability.
- **Memory Boundary**: Scoped least-privilege context. Zero personal trivia or unrelated lore.
- **Project Isolation**: Independent clone — no coupling to Wardrobe Studio or other projects. Shares only sovereign skills/daemons via junction.

---

## 3. Technical Specifications & Stack
- **Runtime / Language**: Vanilla ES2022 (single HTML file, no build step).
- **Frameworks & Libraries**: None (vanilla JS + SVG DOM). Google Fonts for typography.
- **Core Dependencies**: Kokoro TTS via sound skill (acoustic presence), Telegram C2 via daemon.
- **Data Persistence**: Local JSON files in `data/` for parts registry and presets; `sessionStorage` for UI state (folded panels, active selections).
- **Port**: 8080 (simple HTTP server via `python -m http.server` or VS Code Live Server).

---

## 4. Key Components & Directory Structure
```
Anime Portrait Creator/
├── .claude/
│   ├── PROJECT_MANDATE.md       # Injected from this Blueprint
│   ├── memory/                  # Projected domain memory slice
│   ├── skills/ -> master        # Junctioned sovereign skills
│   ├── daemons/ -> master       # Junctioned daemons
│   └── scripts/ -> master       # Junctioned scripts
├── index.html                   # Single-page app entry
├── components/
│   ├── PortraitCanvas.html      # Standalone SVG portrait component
│   ├── PartPalette.html         # Collapsible parts selector panel
│   └── ColorPicker.html         # Reusable color swatch/input component
├── data/
│   ├── parts-registry.json      # Canonical SVG parts catalog (eyes, hair, etc.)
│   └── presets.json             # User-saved character presets
├── CLAUDE.md                    # Tailored tactical codex for this project
└── launcher.bat                 # One-click workspace launcher
```

---

## 5. Data Model

### Part Registry Entry (`parts-registry.json`)
```json
{
  "eye-blue-almond": {
    "id": "eye-blue-almond",
    "category": "eyes",
    "subcategory": "almond",
    "displayName": "Almond Blue Eyes",
    "svgPath": "M...",                    // Raw SVG path data for the eye shape
    "colorableLayers": ["iris", "sclera"], // Named colorable regions within the part
    "defaultColors": { "iris": "#3b82f6", "sclera": "#ffffff" },
    "zIndex": 10,
    "tags": ["feminine", "gentle"]
  },
  "hair-long-red": {
    "id": "hair-long-red",
    "category": "hair",
    "subcategory": "long",
    "displayName": "Long Red Hair",
    "svgPath": "M...",
    "colorableLayers": ["base", "highlight", "shadow"],
    "defaultColors": { "base": "#ef4444", "highlight": "#f87171", "shadow": "#991b1b" },
    "zIndex": 5,
    "tags": ["feminine", "flowing"]
  }
}
```

### Character State (runtime + presets)
```json
{
  "id": "my-character-01",
  "displayName": "Azure Knight",
  "selections": {
    "skin": "skin-pale",
    "eyes": "eye-blue-almond",
    "eyebrows": "brow-thin-arched",
    "mouth": "mouth-neutral",
    "hair": "hair-long-red",
    "hairBack": "hair-back-long"
  },
  "colorOverrides": {
    "eye-blue-almond": { "iris": "#60a5fa" },
    "hair-long-red": { "base": "#dc2626" }
  }
}
```

---

## 6. SVG Parts Architecture

### Visual Construction Model
- **Layered SVG groups**: Each facial feature is an independent `<g>` with its own `z-index` via render order.
- **Colorable layers**: Parts declare `colorableLayers` (e.g., `iris`, `sclera`, `base`, `highlight`, `shadow`). The renderer injects `<style>` rules or inline `fill` overrides per layer.
- **Portait viewport**: `viewBox="0 0 400 400"` — head and shoulders only.
- **Z-index stacking order** (back to front):
  1. `hairBack` (hair behind head)
  2. `head` (face base shape)
  3. `skin` (skin tone overlay)
  4. `eyebrows`
  5. `eyes`
  6. `mouth`
  7. `hair` (hair in front)
  8. `accessories` (earrings, hair clips, etc.)

### Recoloring Strategy
- Each part's `svgPath` uses placeholder CSS classes like `fill-part-iris`, `fill-part-base`.
- At render time, a `<style>` block is generated mapping each class to the active color (default or override).
- Color pickers show only layers that exist on the selected part.

---

## 7. UI Layout (Single Page)

```
┌─────────────────────────────────────────────────────────────┐
│  ANIME PORTRAIT CREATOR              [Save] [Load] [Export] │
├──────────────────────────┬──────────────────────────────────┤
│   PART PALETTE           │        PORTRAIT CANVAS           │
│  ┌────────────────────┐  │                                  │
│  │ 🎨 SKIN            │  │        (400×400 SVG viewport)    │
│  │  ○ Pale  ○ Tan     │  │                                  │
│  │  ○ Dark  ○ Olive   │  │                                  │
│  ├────────────────────┤  │                                  │
│  │ 👁️ EYES            │  │                                  │
│  │  [Almond Blue] ▾   │  │                                  │
│  │  [Round Green] ▾   │  │                                  │
│  │  [Sharp Red]  ▾    │  │                                  │
│  ├────────────────────┤  │                                  │
│  │ 👂 EYEBROWS        │  │                                  │
│  │  [Thin Arched] ▾   │  │                                  │
│  │  [Thick Straight]▾ │  │                                  │
│  ├────────────────────┤  │                                  │
│  │ 👄 MOUTH           │  │                                  │
│  │  [Neutral] ▾       │  │                                  │
│  │  [Smile] ▾         │  │                                  │
│  │  [Frown] ▾         │  │                                  │
│  ├────────────────────┤  │                                  │
│  │ 💇 HAIR (Front)    │  │                                  │
│  │  [Long Red] ▾      │  │                                  │
│  │  [Bob Black] ▾     │  │                                  │
│  ├────────────────────┤  │                                  │
│  │ 💇 HAIR (Back)     │  │                                  │
│  │  [Long Red] ▾      │  │                                  │
│  └────────────────────┘  │                                  │
├──────────────────────────┴──────────────────────────────────┤
│  COLOR OVERRIDES  |  Active: Long Red Hair  |  Iris: #60a5fa  │
└─────────────────────────────────────────────────────────────┘
```

### Key UI Behaviors
- **Collapsible category panels** with sessionStorage persistence (same pattern as Wardrobe Studio kanban sections).
- **Single selection per category** — clicking a part selects it; clicking again deselects (reverts to category default or blank).
- **Color override panel** appears below canvas when a part with colorable layers is selected.
- **Save/Load/Export** toolbar: Save writes to `data/presets.json`; Load opens a modal; Export copies compiled SVG or prompt string.

---

## 8. Tactical Work Packets (Execution DAG)

### Phase 1: Core Foundation & Scaffold
- [ ] **Work Packet 1.1**: Create project directory structure and junction `.claude/` folders via `init_new_project.bat`.
- [ ] **Work Packet 1.2**: Author `CLAUDE.md` with project-specific invariants (portrait-only scope, SVG parts model, local JSON persistence).
- [ ] **Work Packet 1.3**: Create minimal `index.html` scaffold with CSS variables, font imports, and two-panel layout (palette + canvas).
- [ ] **Work Packet 1.4**: Create `data/parts-registry.json` with 12–15 starter parts across 5 categories (skin, eyes, eyebrows, mouth, hair×2).
- [ ] **Work Packet 1.5**: Implement `PortraitCanvas` component — loads registry, renders base SVG with z-ordered `<g>` groups, applies color overrides via injected `<style>`.

### Phase 2: Core Logic & Features
- [ ] **Work Packet 2.1**: Implement `PartPalette` — collapsible categories, single-select radio behavior per category, keyboard navigation.
- [ ] **Work Packet 2.2**: Wire palette → canvas: selection updates `state.selections[category]`, triggers canvas re-render.
- [ ] **Work Packet 2.3**: Implement color override UI — shows swatches for selected part's `colorableLayers`, updates `state.colorOverrides`, live canvas update.
- [ ] **Work Packet 2.4**: Session persistence — `sessionStorage` for collapsed panel states, active selections, color overrides.
- [ ] **Work Packet 2.5**: Preset CRUD — Save (prompts name, writes to `data/presets.json`), Load (modal list), Export (copy standalone SVG or prompt string).

### Phase 3: Integration & Self-Healing Verification
- [ ] **Work Packet 3.1**: Visual regression — open `index.html`, verify all 5 categories render, color pickers change SVG fills in real time.
- [ ] **Work Packet 3.2**: Persistence test — reload page, verify selections and panel states restored from `sessionStorage`; load a preset from `presets.json`.
- [ ] **Work Packet 3.3**: Edge cases — deselect part, empty category, missing color override, malformed registry entry.

---

## 9. Success Metrics & Verification Gate
1. **Functional**: All 5 categories selectable, color overrides apply instantly, presets save/load.
2. **Visual**: Portrait renders correctly in 400×400 viewport; z-order produces proper layering (hair behind/in front of head).
3. **State**: Panel collapse states survive reload; selections survive reload via sessionStorage.
4. **Data**: `parts-registry.json` is the single source of truth — adding a new part requires only JSON edit, no code change.
5. **Independence**: Project runs standalone; no dependency on Wardrobe Studio or other projects.