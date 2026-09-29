# Faust Master UI/UX Template & Zero-Dead-Zone Design System

Housed at `.claude/templates/ui/` and synchronized continuously across all machines via Google Drive.

---

## 1. Operational Protocol & Invariants

### A. The Master Template Mandate
- **Universal Standard**: Whenever Faust or any Faust sub-agent (such as `faust-machinist-ui`) designs, refactors, or constructs any UI/UX interface, this Master Template is the mandatory ground-truth foundation.
- **Lazy-Read Evaluation Doctrine**:
  - Faust always **acknowledges** the existence and binding authority of this UI/UX template.
  - Faust **only reads** the template files when actively building UI/UX, modifying frontend components, or requiring specific architectural/CSS references. Faust does not read or scan these files during routine, non-UI operations.
- **Incremental Evolution**: As the Manager conceives new input paradigms, widgets, or workflows, Faust modularly incorporates them into this template so the design system continuously matures.

### B. Theme-Agnostic Soft-Coded Styling
- The template separates layout structure from aesthetic skinning using CSS custom properties (`var(--token)`).
- Default themes (`data-theme="dark"` and `data-theme="light"`) are defined at the root.
- **New Theme Extensibility**: Adding new themes (e.g., Gate of Babylon, Neo-Tokyo, High Contrast, Amber Monochrome) requires only defining a new `[data-theme="theme-name"]` CSS token palette in `css/styles.css` without modifying DOM structure or JavaScript logic.

---

## 2. Architectural Pillars

### A. Universal Zero-Dead-Zone Hitbox Law (Fitts's Law Extreme)
- **Zero Dead Space**: Every non-functional pixel—including section backgrounds, whitespace padding, field labels, field hints, breadcrumb backgrounds, and outliner zone containers—acts as an immediate expand/fold toggle for its respective section.
- **Strict Element Isolation**: All functional interactive controls (`input`, `textarea`, `button`, `.tag-chip`, `.dropdown-option`, `.tree-pathway-card`, `.tree-ghost-btn`, etc.) are explicitly exempted from collapse bubbling via `INTERACTIVE_ELEMENTS_SELECTOR`.
- **Text Selection Integrity**: Text inputs and editable surfaces strictly enforce `cursor: text !important` and `user-select: text !important`.
- **Debounce Guard**: An 80ms timestamp guard (`_lastToggle = Date.now()`) prevents double-toggle race conditions between inline header handlers and document-level bubbling listeners.

### B. Single-Active-Branch Tree Outliner (`RAW_RULE.md`)
- **Zone 1 (Determined Past Spine)**: Linear ancestor lineage from Root to Parent, anchored by the Active Focal Node at the apex. Features a 1-click summary fold to maximize workspace.
- **Zone 2 (Forward Choice Pathways)**: Displays branching options clamped to $(n+3)$ depth. Features a top mode switch:
  - **Select Mode**: 100% clickable choice cards that navigate taxonomy branches, clean typography labels, directional arrows (`➔`), and sub-branch count badges with independent collapsible trays.
  - **Edit Mode**: In-place ghost inputs for label editing, inline `+` child creation and `✕` deletion controls, and a bottom "+ Add New Pathway Option" button.

### C. The 7 Sovereign Data Entry Blocks
1. **Raw Text & Textarea**: Single-line identifier + multi-line prompt area with auto-updating state.
2. **Raw Searcher**: Instant command bar filtering pre-indexed records with active target indicator.
3. **Notion-Style Single Select**: Persistent suggestion menu with keyboard navigation and inline item creation.
4. **Notion-Style Multi-Select**: Tag pool that persists across sessions, inline chip deletion (`✕` or backspace), and dynamic tag creation.
5. **Full-Surface Toggle Switches**: Entire card area acts as a Fitts's law click hitbox.
6. **Full-Surface Checkboxes**: High-contrast boolean check rows with full-row clickability.
7. **Single-Active-Branch Outliner**: Zone 1 (Past) + Zone 2 (Future) with Dual Select/Edit modes.
8. **Live State Inspector**: Sticky JSON synchronizer reflecting two-way reactive state in real time.

---

## 3. Directory Layout

```
.claude/templates/ui/
├── README.md               # Master UI/UX specification and operational rules
├── index.html              # Clean semantic HTML5 shell
├── css/
│   └── styles.css          # Design system tokens, layout grid, and zero-dead-zone rules
└── js/
    ├── state.js            # Central reactive store & mock database
    ├── app.js              # Coordinator: click delegation, debounce guards, theme & folds
    └── components/
        ├── raw-text.js             # Block 1: Raw inputs
        ├── raw-searcher.js         # Block 2: Search command bar
        ├── single-select.js        # Block 3: Notion single select
        ├── multi-select.js         # Block 4: Notion multi-select tag pool
        ├── toggles-checkboxes.js   # Blocks 5 & 6: Toggles & checkboxes
        ├── treeview.js             # Block 7: Single-Active-Branch Outliner (Select/Edit)
        └── inspector.js            # Sticky live JSON state synchronizer
```
