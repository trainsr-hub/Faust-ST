# Plan: Notion-Style Table + Right Sidebar Field Editor

**File**: `ui-test-standalone.html`  
**Date**: 2026-10-12  
**Problem**: The current UI stacks every field's editor cards vertically — noisy, confusing, hard to scan at a glance.  
**Goal**: The main view looks like a clean Notion/Airtable table (column headers + rows of cells). Clicking any row opens its field editor detail in a right sidebar that slides in. No accordion cards, no color-coded sections in the main view.

---

## Research Findings

### Industry Pattern: Master-Detail / Side Peek

| Tool | Table UX | Click Action | Detail UI |
|---|---|---|---|
| **Notion** | Grid with typed column headers | Row → "Side peek" slides from right | Full page or right panel |
| **Airtable** | Spreadsheet grid | Hover → expand icon ⤢ → modal or side drawer | Stacked form layout |
| **NocoDB** | Spreadsheet grid | Expand row icon → right drawer | Labeled field form |
| **Linear** | Issue list | Click row → right panel | Properties panel |

**Common denominator:**
1. Grid/table = read-only scan surface. Each column = one field type. Each row = one record/entity.
2. Click → the detail panel slides in from the right with the full editable form for that row.
3. Table stays visible (behind or alongside the panel).
4. No color-coded sections or accordion cards cluttering main view.

---

## Architecture Plan

### Layout

```
┌──────────────────────────────────┬───────────────────────────────┐
│  HEADER (title, tabs, toolbar)   │                               │
├──────────────────────────────────┤                               │
│  TABLE (Notion-style)            │   FIELD EDITOR SIDEBAR        │
│  ┌──┬──────────┬──────┬───────┐ │   (slides in on row click)    │
│  │  │ Col Name │ Type │ Slug  │ │                               │
│  ├──┼──────────┼──────┼───────┤ │   ▸ Column Name input         │
│  │  │ User ID  │ 🔑   │ id    │ │   ▸ Column Type select        │
│  │  │ Username │ 📝   │ user… │ │   ▸ Metadata (prefix/opts...) │
│  │  │ Email    │ 📝   │ email │ │   ▸ Slug input                │
│  └──┴──────────┴──────┴───────┘ │   ▸ Delete button             │
│  + Add Field row                 │                               │
└──────────────────────────────────┴───────────────────────────────┘
```

- **Main area**: full-width when sidebar closed; shrinks to ~60% when sidebar open.
- **Sidebar**: fixed 380px wide, slides in with CSS `transform: translateX(100%)` → `translateX(0)`. Overlaps on mobile.
- **Selected row**: highlighted accent left-border or background tint to show it's active.

### Table Structure

Each **table row** = one column definition. Table header columns:

| # | Column Name | Type | Slug | SQL Type | Actions |
|---|---|---|---|---|---|
| drag handle | name | icon + label chip | monospace | auto-computed | ⟨move▲▼⟩ ⟨delete⟩ |

- Type cells show the colored icon + type name badge — color lives in the **cell chip only**, not full-row background.
- Clicking anywhere on a row selects it and opens the sidebar editor.
- Hovering row shows expand icon `⤢` and soft row highlight.

### Sidebar

- Header: `Column #3 — Username | 📝 Text (single)` 
- Body: vertically stacked labeled fields (Name, Slug, Type dropdown, metadata section).
- Footer: `Delete Column` danger button.
- Close: `✕` button top-right, or press Escape.
- Prev `◀` / Next `▶` navigation arrows to jump between columns.
- SQL/JSON inspector code view as a second tab inside the sidebar.

### Animations

- Sidebar slide: `transform + opacity`, 220ms `cubic-bezier(0.16, 1, 0.3, 1)`.
- Row selection: instant background tint + left border accent.
- Table rows: subtle hover background tint.

### Kept From Existing Code

- All data model (`MOCK_DATA`, `FIELD_TYPES`, `tables`, mutation functions).
- Drag-and-drop engine (PointerEvents FLIP) for column-order chip strip.
- Quick-add field type buttons — row at bottom of table.
- Filter bar — toolbar above the table.
- Toast notification system — unchanged.
- Theme toggle — unchanged.

### Removed / Replaced

- Stacked `column-card` accordion layout → **replaced by table rows**.
- `column-card-body` expansion → **replaced by right sidebar**.
- `inspector` right panel → **merged into sidebar as second tab**.
- `workspace` two-column grid → **replaced by table-workspace + sliding sidebar**.

---

## Implementation Steps

1. **CSS**: New table styles (`notion-table`, `table-row`, `table-cell`, hover/selected states). Sidebar CSS (`field-sidebar`, `.sidebar-open` class on body). Layout: flex row, sidebar overlay.
2. **HTML**: Replace `<main class="workspace">` with `<main class="table-workspace">` + `<aside class="field-sidebar" id="field-sidebar">`.
3. **JS — `renderColumns()`**: Renders `<tbody>` rows instead of card stack.
4. **JS — `openSidebar(idx)` / `closeSidebar()`**: Selects row, populates sidebar, toggles class.
5. **JS — `renderSidebar()`**: Editable form for selected column.
6. **JS — `navigateSidebar(dir)`**: Prev/next arrow navigation.
7. **JS — drag tokens**: Kept for compact chip strip above table.
8. **JS — filter**: Toolbar above table, same logic.
9. **JS — inspector**: SQL/JSON inside sidebar second tab.

---

## Color Scheme for Type Chips (cells only, not full row bg)

```
pk:      #38bdf8  (blue)
text:    #10b981  (green)
scalar:  #f59e0b  (amber)
boolean: #a78bfa  (violet)
enum:    #f43f5e  (rose)
rel:     #ff9e1b  (orange/accent)
```
