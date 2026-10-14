# PROJECT MASTER ROADMAP: PK NETWORK (CLOUDFLARE + TURSO MVP)

> **Core Vision**: A world-class, ultra-lightweight Edge webapp hosted on Cloudflare Workers connected to Turso Cloud SQLite. Serves as the Manager's sovereign data entry and schema management system, accessible anywhere on PC and Mobile with zero latency and zero cost.

---

## 📌 MASTER ROADMAP STATUS

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THREE-PHASE MASTER ROADMAP                      │
├─────────────────────┬───────────────────────────┬──────────────────────┤
│  PHASE 1 [DONE ✅]  │  PHASE 2 [DONE ✅]        │  PHASE 3 [DONE ✅]   │
│  Cloudflare Public  │  Edge Secret Auth         │  UI/UX Refinement    │
│  (Proof of Concept) │  (Stability & Security)   │  (Pure English UI)   │
└─────────────────────┴───────────────────────────┴──────────────────────┘
```

---

## 🌐 LIVE INFRASTRUCTURE TELEMETRY

* **Production URL**: [https://pk-network.kha70929.workers.dev](https://pk-network.kha70929.workers.dev)
* **1-Click Magic Link**: [https://pk-network.kha70929.workers.dev/?key=toiyeufaust](https://pk-network.kha70929.workers.dev/?key=toiyeufaust)
* **Hosting Platform**: Cloudflare Workers with Static Assets (`wrangler.jsonc`, nodejs_compat, ASSETS binding).
* **Database Engine**: Turso Cloud SQLite (`aws-ap-southeast-2` Sydney cluster, latency ~0.8ms from Edge).
* **Database URL**: `https://heraclitus-rien-bluerose.aws-ap-southeast-2.turso.io`
* **Edge Protocol**: Direct HTTP Pipeline API v2 (`worker/turso.ts`), zero Node C-bindings, pure V8 fetch.
* **Authentication**: Edge-evaluated single secret string (`APP_AUTH_KEY: "toiyeufaust"`), $O(1)$ memory comparison (<0.05ms, zero DB queries), persistent device session via `localStorage`.
* **Data Persistence Engine**: Pure RAM execution for 0ms UI reactivity + field-level delta diff syncing to Turso Cloud SSOT. Zero hard-disk footprint on client devices.
* **Startup Performance**: Zero-waterfall boot. Single query for active table only; foreign relations loaded lazily on demand.
* **Language Standardization**: 100% Pure English interface across all components, forms, alerts, and tooltips.
* **Synchronized Live Tables**: `quotes`, `containers`, `specifics`, `themes`, `usages`, `notes`, `projects`, `users`, `_schema_definitions`, `_system_tables`.

---

## 📂 REPOSITORY ANATOMY (`D:\My Drive\Blue AI\PK Network`)

```
PK Network/
├── worker/
│   ├── index.ts        # Hono routing, Edge auth middleware, schema & CRUD endpoints
│   └── turso.ts        # Turso HTTP Pipeline v2 client (fetch-native)
├── src/
│   ├── components/
│   │   ├── VaultGate.tsx          # Monolithic lock screen for unauthenticated visitors
│   │   ├── Header.tsx             # Brand emblem, Turso live status, mode toggle, theme
│   │   ├── TableTabs.tsx          # Table switcher tabs with live record counters
│   │   ├── DataGrid.tsx           # Notion-style desktop grid view (<255 lines)
│   │   ├── GridHeader.tsx         # Modular sorting headers & formula badges (<70 lines)
│   │   ├── GridToolbar.tsx        # Search, live stats, and bulk record deletion bar (<85 lines)
│   │   ├── GridCell.tsx           # Atomic type cell renderers, 1-click copy, and inline editors (<215 lines)
│   │   ├── MobileCardView.tsx     # Touch-friendly card list for small screens (<768px, <240 lines)
│   │   ├── MobileRecordDrawer.tsx # Thumb-accessible bottom sheet form with min-h-[48px] inputs (<290 lines)
│   │   ├── SchemaView.tsx         # Notion-style visual schema & column architect (<230 lines)
│   │   ├── ColumnEditorDrawer.tsx # Modular column architect drawer & formula preview (<230 lines)
│   │   └── AuthModal.tsx          # Settings modal to update or clear passcode
│   ├── services/
│   │   ├── api.ts      # Fetch bridge, auto-injects X-App-Key, handles ?key= magic link
│   │   └── formula.ts  # Soft-coded formula engine (MAX, COUNT, TODAY, IF, dependencies)
│   ├── styles/         # CSS design tokens, typography, dark/light theme definitions
│   ├── types/          # TypeScript interfaces for 10 atomic data types, schemas, records
│   ├── App.tsx         # Pure RAM reactive state, zero-waterfall boot (<285 lines)
│   └── main.tsx        # React 18 DOM mount
├── wrangler.jsonc      # Cloudflare Workers configuration with assets & env vars
├── run_pk.bat          # 1-Click local dev server (Vite :20150 + Worker :8787)
└── package.json        # Dependencies: Hono, React 18, Vite 6, TypeScript 5, Lucide-react
```

---

## 🎯 PHASE 3: COMPREHENSIVE SPECIFICATION & EXECUTION BLUEPRINT

> **Phase 3 Goal**: Elevate the UI/UX from functional MVP to a state-of-the-art, Notion/Linear-grade product adhering strictly to the **Master UI/UX Doctrine** and **Karpathy Simplicity**.

### 1. Master UI/UX Doctrine Laws to Enforce
1. **Monolithic Vertical Height Law**:
   - Primary action buttons: `min-h-[56px] - min-h-[60px]`.
   - Search/Filter inputs: `min-h-[48px]`.
   - Grid inline cells & standard inputs: `min-h-[44px]`.
   - Strictly forbid micro-hitboxes (<36px) that degrade mobile thumb accuracy.
2. **Universal Full-Surface Target Law (Zero Dead Zones)**:
   - Mobile cards and desktop rows must be 100% clickable.
   - Any empty cell area triggers edit mode; card surfaces trigger the bottom drawer.
3. **Single-Active-Branch & Fluid Outliner**:
   - Zone 1: Fast table switcher and context spine.
   - Zone 2: Focused grid/card workspace with instantaneous optimistic updates.
4. **Theme-Agnostic Extensibility**:
   - Soft-coded tokens (`data-theme="dark"|"light"`) using curated Slate/Zinc palettes.
   - Premium typography using IBM Plex Sans and IBM Plex Mono.

---

### 2. Detailed Phase 3 Workstreams

#### Workstream A: Desktop Notion-Style Grid Refinement (`DataGrid.tsx`)
* **Cell Editors by Atomic Type**:
  - `enum_single` / `enum_multi`: Dropdown badge picker with search & vibrant tag pills.
  - `relation_single` / `relation_multi`: Popover selector pointing to target table rows.
  - `boolean`: Tactile custom toggle / checkbox with immediate optimistic update.
  - `hex_id`: Read-only mono chip with 1-click copy to clipboard.
  - `text_multi`: Compact preview with expand-on-focus modal/popover.
* **Keyboard Navigation**:
  - `Arrow keys` for cell traversal.
  - `Enter` / `F2` to enter inline edit; `Esc` to cancel.
  - `Tab` / `Shift+Tab` to jump to adjacent cells.
* **Column Actions**: Sort (Asc/Desc), Search filter bar, Column width resizing, Show/Hide columns.
* **Bulk Operations**: Multi-row selection checkbox column with bulk delete action bar.

#### Workstream B: Mobile First-Class Ergonomics (`MobileCardView.tsx` & `MobileRecordDrawer.tsx`)
* **Mobile Card List (`< 768px`)**:
  - Full-width tactile cards with high contrast badges for enum/relation fields.
  - Smooth virtual/paginated scrolling for large record sets.
  - Floating Action Button (FAB) for `+ New Record` positioned comfortably at bottom-right thumb zone.
* **Record Drawer (Bottom Sheet)**:
  - Native gesture-like slide up from bottom with backdrop blur.
  - Form fields adhering to `min-h-[48px]` with clear labels and validation.
  - Sticky bottom save/cancel bar that remains accessible even with virtual keyboard open.

#### Workstream C: Schema Architect Polish (`SchemaView.tsx`)
* **Visual Column Builder**:
  - Easily add, rename, retype, and delete columns.
  - Configure column metadata: Prefix ID (`QUOT-`, `SPEC-`), Enum options list, Relation target table.
  - Default formula editor supporting `=MAX(idx) + 1` and `=TODAY()`.
* **Zero-Downtime DDL Sync**:
  - Safeguarded `ALTER TABLE ADD COLUMN` queries to Turso Cloud without dropping data.

#### Workstream D: Aesthetic Polish & Micro-Interactions
* Glassmorphic header with live pulse status indicator for Turso connectivity.
* Smooth page/mode transitions and optimistic UI updates (zero loading jitter).
* High-contrast dark mode with glowing accents (`var(--accent)`).
* Audio/haptic feedback cues if desired.

#### Workstream E: Hierarchical System Table Registry & Dynamic Navigation
* **The Sovereign Meta-Table (`_system_tables`)**:
  - Replace hardcoded table lists with an authoritative database table storing all data tables as records.
  - Store Table Natural Language Name, alphanumeric `id`, and parent table selector.
* **Hierarchical Table Navigation (`TableHierarchyBar.tsx`)**:
  - Transition away from flat, overflowing horizontal tab strips.
  - Implement a Single-Active-Branch breadcrumb and cascading selector representing parent-child domain relationships.
  - Support instant table creation, renaming, and parent reparenting directly from the UI.

---

## 🏛️ SYSTEM TABLE ARCHITECTURE & HIERARCHICAL TOPOLOGY

> **Architectural Paradigm**: Tables in PK Network are first-class sovereign records registered inside a dedicated database meta-table (`_system_tables`). This decouples UI navigation from raw DDL, supports rich natural language titling, and establishes explicit parent-child domain hierarchies.

### 1. The `_system_tables` Canonical SQLite Schema

```sql
CREATE TABLE IF NOT EXISTS _system_tables (
  id TEXT PRIMARY KEY,                 -- Lowercase, alphanumeric identifier (e.g. 'quotes', 'containers')
  name TEXT NOT NULL,                  -- Natural Language Display Name (e.g. 'Quotes & Excerpts')
  parent_id TEXT,                      -- Selector referencing parent table's id (NULL for root entities)
  icon TEXT,                           -- Lucide icon slug (e.g. 'box', 'layers', 'quote', 'hash')
  order_index INTEGER DEFAULT 0,       -- Display sort sequence among sibling tables
  description TEXT,                    -- Domain purpose and documentation
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES _system_tables(id) ON DELETE SET NULL
);
```

### 2. Invariants & Metadata Guarantees

1. **Table ID Invariant (`id`)**:
   - Strictly `lowercase, alphanumeric` format with underscores allowed (`^[a-z0-9_]+$`).
   - Maps 1:1 to the physical SQLite table name created in Turso Cloud.
   - Immutable primary key; ensures URL routing and relational joins remain deterministic.
2. **Natural Language Name (`name`)**:
   - Human-readable, descriptive, capitalized string displayed in the UI navigation, headers, breadcrumbs, and mobile sheets (e.g., `"Quotes & Excerpts"`, `"Containers"`, `"Specific Collections"`).
3. **Parent Selector (`parent_id`)**:
   - Foreign key pointing to the `id` of another table in `_system_tables`.
   - If `parent_id IS NULL`, the table is designated as a **Root Level Entity** (Domain Container).
   - If populated, the table is designated as a **Child Sub-Table** belonging to the parent entity.
4. **The Project Logic Gate Invariant (Manager's Law)**:
   - The System Table is **not** edited as a raw spreadsheet/grid like user data tables.
   - All mutations to `_system_tables` occur strictly through the **inner logic of the project at the table level**:
     - *Renaming*: Changing a table's display title in the UI triggers project logic to atomically update `name` in `_system_tables`.
     - *Reparenting*: Selecting a parent table from a selector dropdown updates `parent_id` in `_system_tables`.
     - *Creation*: The `+ New Table` action prompts for Natural Name and Parent Selector, generating the alphanumeric ID and atomically registering the physical table, schema, and `_system_tables` record.
     - *Deletion*: Table Settings deletion safely unlinks relations and unregisters the entry.

---

### 3. Core Relational Topology Map

```
┌────────────────────────────────────────────────────────────────────────┐
│               PK NETWORK HIERARCHICAL DOMAIN TOPOLOGY                  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [ROOT] Containers ("Containers")                                      │
│    │    id: "containers" | parent_id: NULL                             │
│    │                                                                   │
│    └───► [CHILD] Specific Collections ("Specific Collections")         │
│            │      id: "specifics" | parent_id: "containers"            │
│            │                                                           │
│            └───► [SUB-CHILD] Quotes ("Quotes & Excerpts")              │
│                   id: "quotes" | parent_id: "specifics"                │
│                                                                        │
│  [ROOT] Themes & Taxonomies ("Themes")                                 │
│         id: "themes" | parent_id: NULL                                 │
│                                                                        │
│  [ROOT] Contextual Usages ("Usages")                                   │
│         id: "usages" | parent_id: NULL                                 │
│                                                                        │
│  [ROOT] Projects & Initiatives ("Projects")                            │
│         id: "projects" | parent_id: NULL                               │
│                                                                        │
│  [ROOT] System Operators ("Users")                                     │
│         id: "users" | parent_id: NULL                                  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4. UI/UX Transformation: From Flat Tabs to Dynamic Hierarchy

#### A. Flaws of Legacy Horizontal Tabs (`TableTabs.tsx`)
* **Horizontal Scroll Fatigue**: As tables multiply, tabs overflow horizontally, hiding critical tables off-screen and requiring cumbersome horizontal mouse-wheel/swipe navigation.
* **Loss of Domain Context**: Flat tabs treat `quotes` and `containers` as siblings, obscuring the fact that `quotes` are children of `specifics`, which in turn live within `containers`.
* **Raw Machine Naming**: Displays raw slug strings like `specifics` rather than polished natural language names like `"Specific Collections"`.

#### B. The New Hierarchical Navigation Engine (`TableHierarchyBar.tsx`)
Adhering to the **Master UI/UX Doctrine (Single-Active-Branch Outliner)**:
1. **Root Pill Bar (Level 1)**:
   - Displays all Root tables (`parent_id IS NULL`) as high-contrast tactile pills with their Natural Language names, icons, and live row count chips.
   - Adheres to `min-h-[44px]` touch height.
2. **Cascading Branch Breadcrumb (Level 2 & Level 3)**:
   - Selecting a root entity (e.g. `"Containers"`) instantly cascades its child entities (`"Specific Collections"`) as an active sub-branch right below or inline.
   - Breadcrumb trail: `Containers / Specific Collections / Quotes & Excerpts`.
   - Each breadcrumb node features a dropdown selector to jump to any sibling table at that depth.
3. **Hierarchy Tree Overview (Modal/Drawer)**:
   - A single-click Tree Map button opening a visual nested tree of all data tables.
   - Allows adding a new child table directly under any parent with 1 click.
4. **Mobile First-Class Ergonomics**:
   - On viewports `< 768px`, table selection transforms into a bottom-sheet drawer with nested collapsible groups, meeting the `min-h-[48px]` thumb hitbox requirement.

---

### 5. Backend API Contracts & Workers Implementation

#### Endpoints in `worker/index.ts`:
* `GET /api/tables`:
  - Fetches all records from `_system_tables` ordered by `order_index ASC`.
  - Enriches each record with live row counts (`SELECT COUNT(*) FROM <table>`).
  - Returns hierarchical nested JSON tree or flat list with parent references.
* `POST /api/tables`:
  - Payload: `{ id: string, name: string, parent_id?: string, icon?: string, description?: string }`.
  - Validates `id` against `^[a-z0-9_]+$`.
  - Creates physical table in Turso Cloud (`CREATE TABLE IF NOT EXISTS <id> (...)`).
  - Inserts record into `_system_tables`.
* `PATCH /api/tables/:id`:
  - Updates table metadata (rename natural language `name`, change `parent_id` selector, update icon or sequence).
* `DELETE /api/tables/:id`:
  - Safeguarded drop (`DROP TABLE <id>`) and unregisters from `_system_tables`.

#### Auto-Seed Invariant:
On worker initialization, if `_system_tables` does not exist:
1. Executes `CREATE TABLE IF NOT EXISTS _system_tables (...)`.
2. Seeds core entities (`containers`, `specifics`, `quotes`, `themes`, `usages`, `projects`, `users`) with their natural language titles and established parent-child links.

---

## 📁 TABLE GROUPS & WORKSPACE OUTLINER TAXONOMY (MODEL B)

> **Architectural Paradigm**: Separates high-level workspace organization (Folder Taxonomy via `table_groups` and nested `sub_group_of`) from low-level data flow (`tables.parent_id`). Presented via a collapsible, Notion-style Workspace Outliner.

### 1. `table_groups` Canonical SQLite Schema
```sql
CREATE TABLE IF NOT EXISTS table_groups (
  id TEXT PRIMARY KEY,                 -- Unique identifier / hexid (e.g. 'grp_knowledge', 'grp_literature')
  natural_name TEXT NOT NULL,          -- Human-readable name (e.g. 'Knowledge Base', 'Literature & Insights')
  sub_group_of TEXT,                   -- Self-referencing foreign key to table_groups.id (NULL for root groups)
  order_index INTEGER DEFAULT 0,       -- Sequence ordering among sibling groups
  icon TEXT DEFAULT 'folder',          -- Lucide icon slug
  description TEXT,                    -- Purpose and documentation
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (sub_group_of) REFERENCES table_groups(id) ON DELETE SET NULL
);
```

### 2. Enhanced `tables` Association
```sql
ALTER TABLE tables ADD COLUMN group_id TEXT REFERENCES table_groups(id) ON DELETE SET NULL;
```

### 3. Model B: Collapsible Outliner Sidebar (`WorkspaceOutliner.tsx`)
* **Desktop**: Retractable left-hand navigation pane (`width: 260px` open, `0px` closed) toggled via `[ ☰ Workspace ]` button.
* **Mobile**: Slide-in drawer with backdrop blur and tactile `min-h-[48px]` touch targets.
* **Nested Outliner Tree**:
  - Displays Root Groups with chevron toggles.
  - Expands nested Sub-Groups.
  - Lists associated data tables under their designated group.
  - Highlighting active table, jumping with 0ms RAM switch, auto-unfolding ancestor folders.
* **Inner Logic Governance**:
  - Group creation, renaming, re-parenting, and deletion handled via table/group modal operations.
  - Tables assigned or moved between groups via the **Group Selector** dropdown in `TableSettingsModal.tsx`.

---

## 🛠️ QUICK RE-START COMMANDS (FOR NEXT SESSION)

### Running Locally:
```cmd
cd /d "D:\My Drive\Blue AI\PK Network"
run_pk.bat
```
* **Frontend Vite**: `http://localhost:20150`
* **Cloudflare Worker Backend**: `http://localhost:8787`

### Production Build & Deploy:
```cmd
cd /d "D:\My Drive\Blue AI\PK Network"
cmd /c "npm run deploy"
```
*(Automatically compiles TypeScript, builds Vite production bundle, uploads static assets to Cloudflare global CDN, and updates Worker triggers)*.

