# Hazard Studio & Obsidian UI/UX Design Doctrine (Design_RULE.md)

This document establishes the binding, non-negotiable UI/UX engineering standards, hitbox architectures, kinetic motion laws, TreeView hierarchical patterns, and ergonomic doctrines for all interfaces within the Hazard Trigger and Obsidian Studio ecosystem.

---

## 1. Core Engineering & Interaction Doctrine

```
                                  [ THE TRIAD OF ERGONOMICS ]
                                               ▲
                                              / \
                                             /   \
                                            /     \
                       [ MONOLITHIC HEIGHT ]-------[ FULL-SURFACE TARGETS ]
                                            \     /
                                             \   /
                                              \ /
                                               ▼
                                   [ KINETIC FLUIDITY & RAW TRUTH ]
```

### The Seven Immutable Laws:
1. **Vertical Height Supremacy**: Vertical hitbox height is drastically more critical than horizontal length. Thin single-line inputs (`24px–32px`) are strictly forbidden.
2. **Full-Surface Target Law**: Every interactive container (banners, summary cards, tree rows, variant cards) must be a 100% full-surface click target. No pixel-hunting for tiny corner buttons.
3. **Kinetic Transitions**: All sidebars, drawers, overlays, and disclosure carets must glide smoothly with hardware-accelerated cubic-bezier physics. No abrupt pop-ins.
4. **Notion-Grade Ghost Editing**: High-density tables, lists, and tree nodes must provide seamless, full-height inline editing (`44px` minimum) that blends into typography until hovered or focused.
5. **Radical Simplicity**: Strip away decorative noise, puffy dead padding, redundant explanatory subtitles, and visual clutter. Emphasize raw functionality with crystal clarity.
6. **Maximum Navigation Flexibility**: Jumping, searching, expanding, and cross-referencing between 1,500+ records must be instantaneous and zero-friction.
7. **Raw Data Truth & Absolute Zero Hardcoding**: Show data directly as structured in JSON. Never hardcode entity titles, faction names, or schema labels.

---

## 2. Monolithic Vertical Height Law (Zero "Thread" Inputs)

### The "Thread Hitbox" Anti-Pattern vs. Monolithic Architecture

```
❌ STRICTLY FORBIDDEN: Puffy Wrapper / Thread Input Anti-Pattern
+-------------------------------------------------------------------------------+ 60px Visual Box
|  Padding Top (16px DEAD CLICK ZONE)                                           |
|  [🔍] [-------------------- 24px Thread Input --------------------] [X]       | <- Tiny DOM Box
|  Padding Bottom (16px DEAD CLICK ZONE)                                        |
+-------------------------------------------------------------------------------+

✅ MANDATORY: Monolithic 100% Vertical Fill Architecture
+-------------------------------------------------------------------------------+ 60px Visual Box
| [🔍] |==================================================================| [X] | <- 100% DOM Hitbox
|      | 60px Native DOM Input Element (Zero Vertical Dead Zones)          |     |    (Instant Focus)
+-------------------------------------------------------------------------------+
```

### Standard Control Height Specifications:
| Control Tier | Component Type | Height Requirement | Font Size | DOM Invariants |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | Primary Command / Search Bars | `60px` (`min-h-[60px]`) | `16px–18px` (`text-base` / `text-lg`) | Container `padding: 0 1.25rem`. `<input>` has `height: 100% !important; line-height: 60px !important;` |
| **Tier 2** | Secondary Filters & Modal Search | `48px–52px` (`min-h-[48px]`) | `14px–15px` | 100% vertical DOM coverage, clear active ring on focus. |
| **Tier 3** | Notion-Style Ghost Table / Tree Inputs | `44px` (`min-h-[44px]`) | `13px–14px` | Transparent background, full-cell vertical expansion (`padding: 8px 16px !important`). |
| **Tier 4** | Prompt Editors & Multi-Line Textareas | `100px–140px+` | `14px–15px` | Generous `16px–20px` internal breathing room, auto-resizing. |

---

## 3. Full-Surface Target Law (Generous Hitboxes)

1. **Whole-Surface Container Hitbox**:
   - The interactive trigger for expanding sections, opening drawers, selecting character cards, or viewing variants must be the **entire surface area** of the card or banner.
   - Every clickable surface must declare `cursor-pointer` and clear visual feedback on hover (`hover:bg-hazard-card/50 hover:border-hazard-border`).
2. **Zero Pixel-Hunting Micro-Buttons**:
   - Never restrict interaction to a 16px–20px button in the corner of a card.
   - If an element looks clickable, the entire box must be clickable.
3. **Event Propagation Isolation**:
   - Actions nested inside full-surface cards (e.g. inline trash delete, quick name rename, add child) must isolate their click events:
     ```tsx
     <button onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
     ```
4. **100% Full-Row Selection**:
   - In directories, file trees, and search result tables, every pixel of the table or tree row is selectable.

---

## 4. TreeView & Hierarchical Outliner Architecture (Industry Standard)

In modern design systems (Radix UI, Shadcn, VS Code, Notion, Figma), the **Tree UI** is the definitive pattern for deeply nested, high-density data navigation.

### The Three Industry Archetypes:
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE TREE UI ARCHETYPES                                 │
├───────────────────────────────┬───────────────────────────────┬────────────────────────┤
│ 1. File Explorer / Directory  │ 2. Nested Block Outliner      │ 3. Canvas Layers Panel │
│ (VS Code, GitHub, Obsidian)   │ (Notion, Roam, Workflowy)     │ (Figma, Blender)       │
├───────────────────────────────┼───────────────────────────────┼────────────────────────┤
│ • Strict parent-folder & leaf │ • Every node is both a        │ • Deep visual nesting  │
│   files hierarchy.            │   container and editable text.│ • Visibility / Lock    │
│ • Indent guide lines.         │ • Toggle lists + drag handles.│   toggles on hover.    │
│ • Badge counts on right.      │ • Ghost inline editing.       │ • Component badges.    │
└───────────────────────────────┴───────────────────────────────┴────────────────────────┘
```

### Anatomical Blueprint of a Standard Tree Row:

```
+---------------------------------------------------------------------------------------------------------+ 40px-44px Visual Box
| [Indent Guide] [Chevron] [Node Icon]  [Node Label / Notion Ghost Input]             [Hover Action Rail] |
|                                                                                     [ + ] [ ✏️ ] [ 🗑️ ] |
+---------------------------------------------------------------------------------------------------------+
  ▲               ▲         ▲            ▲                                             ▲
  │               │         │            │                                             │
  1. Depth Rail   2. Trigger 3. Signifier 4. Primary Content Zone                       5. Trailing Actions
```

### The 5 Standard Anatomical Zones:
1. **Indent Guide Rail (`Indentation Guides`)**:
   - Vertical guidelines (`border-l border-white/10`) visually tracing the branch from the parent node down to child leaves.
   - Computed offset: `padding-left: calc(depth_level * 1.25rem)`.
2. **Disclosure Trigger (`Caret / Expander`)**:
   - Rotating directional caret: `0deg` (collapsed `▶`) to `90deg` (expanded `▼`) with `transition-transform duration-200`.
3. **Type Signifier (`Node Icon`)**:
   - Distinct icon designating node type (e.g., Folder vs. File, Master Identity vs. Delta Ego Variant).
4. **Primary Content Hitbox (`Node Label`)**:
   - In display mode: Crisp typography with truncation.
   - In edit mode: Seamless transformation into a **Notion Ghost Input** (`.notion-input`) with zero layout shift.
5. **Trailing Action Rail (`Ghost Action Group`)**:
   - Contextual actions (Add Child, Rename, Delete).
   - Hidden by default (`opacity-0`) and revealed on row hover (`group-hover:opacity-100`).
   - All child actions enforce `e.stopPropagation()` to prevent triggering row selection.

### Reference React/Tailwind Tree Row Component:
```tsx
<div 
  className="group relative flex items-center w-full min-h-[44px] px-3 cursor-pointer hover:bg-hazard-card/60 transition-colors"
  style={{ paddingLeft: `${depth * 20 + 12}px` }}
  onClick={() => onSelect(node)}
>
  {/* Indentation Guide Line */}
  {depth > 0 && <div className="absolute left-3 top-0 bottom-0 border-l border-white/10" />}

  {/* Disclosure Chevron (Rotating) */}
  {node.isExpandable ? (
    <button 
      onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
      className="w-6 h-6 flex items-center justify-center mr-1 text-hazard-muted hover:text-white"
    >
      <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
    </button>
  ) : (
    <div className="w-6 mr-1" />
  )}

  {/* Node Type Icon */}
  <NodeIcon className="w-4 h-4 mr-2 text-hazard-gold" />

  {/* Node Label / Notion Inline Ghost Input */}
  <span className="flex-1 text-sm font-medium truncate select-none">
    {node.label}
  </span>

  {/* Trailing Ghost Actions (Revealed on Row Hover) */}
  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
    <button onClick={(e) => { e.stopPropagation(); onAddChild(node); }} title="Add Child">
      <Plus className="w-3.5 h-3.5 hover:text-hazard-gold" />
    </button>
    <button onClick={(e) => { e.stopPropagation(); onDelete(node); }} title="Delete">
      <Trash2 className="w-3.5 h-3.5 hover:text-red-400" />
    </button>
  </div>
</div>
```

---

## 5. Kinetic Transitions & Fluid Physics

1. **Slide-Over Drawers & Floating Sidebars**:
   - Must use high z-index overlays (`z-50`) with GPU-accelerated transforms rather than resizing or squeezing the main workspace.
   - Motion easing curve: `cubic-bezier(0.16, 1, 0.3, 1)` (fluid kinetic deceleration).
   - Tailwind standard: `transition-all duration-300 ease-out`.
   - Open State: `translate-x-0` | Closed State: `translate-x-full`.
2. **Backdrop Opacity & Blur Fades**:
   - Backdrop overlays must smoothly fade in/out (`transition-opacity duration-300 backdrop-blur-xs bg-black/60`).
3. **Tactile Micro-Feedback**:
   - All interactive cards, pills, and buttons must exhibit tactile micro-scaling on click (`active:scale-95` or `active:scale-[0.98]`).

---

## 6. Notion-Grade Spatial Breathing Room & Inline Ghost Inputs

1. **Ghost Table & Tree Inputs (`.notion-input`)**:
   - Form inputs within data grids, lists, and tree nodes must blend seamlessly into the typography when idle.
   - On hover or focus, they highlight cleanly with a subtle border/ring without shifting page layout.
2. **Breathing Room**:
   - Maintain generous gaps (`gap-3` to `gap-4`) between grid cards and form elements.
   - Avoid dense, cramped walls of micro-controls.

---

## 7. Obsidian CSS Specificity & Host Reset Matrix

Obsidian's native desktop theme injects `.theme-dark input[type="text"] { height: var(--input-height, 30px); }` (specificity `0, 2, 0`), which overrides standard Tailwind utility classes like `.h-12`.

### Mandatory CSS Architecture (`src/view/styles.css`):

```css
/* Monolithic Command & Search Bars (60px Full-Surface Vertical Hitbox) */
.theme-dark .hazard-trigger-studio-root .search-bar-monolith,
.theme-light .hazard-trigger-studio-root .search-bar-monolith,
.hazard-trigger-studio-root .search-bar-monolith {
  min-height: 60px !important;
  height: 60px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  padding-left: 1.25rem !important;
  padding-right: 1.25rem !important;
  display: flex !important;
  align-items: center !important;
  box-sizing: border-box !important;
}

.theme-dark .hazard-trigger-studio-root .search-input-command,
.theme-dark .hazard-trigger-studio-root input.search-input-command,
.theme-light .hazard-trigger-studio-root .search-input-command,
.theme-light .hazard-trigger-studio-root input.search-input-command,
.hazard-trigger-studio-root .search-input-command,
.hazard-trigger-studio-root input.search-input-command {
  height: 60px !important;
  min-height: 60px !important;
  font-size: 16px !important;
  line-height: 60px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  width: 100% !important;
  flex: 1 1 0% !important;
  display: block !important;
  background-color: transparent !important;
}

/* Notion-Style Ghost Table & Tree Input (44px Hitbox with Inline Editing) */
.theme-dark .hazard-trigger-studio-root .notion-input,
.theme-dark .hazard-trigger-studio-root input.notion-input,
.hazard-trigger-studio-root .notion-input,
.hazard-trigger-studio-root input.notion-input {
  height: 44px !important;
  min-height: 44px !important;
  padding: 8px 16px !important;
  font-size: 13px !important;
  width: 100% !important;
  display: block !important;
}
```

---

## 8. Scalability & High-Performance Architecture

1. **Path-Only Lightweight Indexing**:
   - When indexing large dataset directories (e.g. 1,500+ character JSON files across `Hazard_Trigger_Data/Identity/Characters`), index only the directory file paths and basenames on initial mount.
   - Do **not** read or parse JSON bodies into memory until a specific character is selected by the user.
2. **Instant Search & Real-Time Filtering**:
   - Provide instant client-side string filtering over pre-indexed identifiers.
   - Render virtualized or scrollable lists with fast response times.

---

## 9. Raw Truth & Ground-Truth Schema Invariant

The single source of truth for all Character and Variant identities is `Hazard_Trigger_Data/Identity/Characters/<Batch>/<ID>.json` (e.g. `TT01/A01.json`).

### Canonical Schema:
```json
{
  "default": {
    "id": "A01",
    "names": {
      "names": ["Amelia Watson"],
      "nicknames": ["Ame", "Watson"],
      "aliases": ["Hololive's #1 Detective"]
    },
    "associate": ["HoloMyth"],
    "hazardLevel": {
      "hazardScore": 3.0
    },
    "taxonomy": {
      "archetype": [],
      "personalityTropes": [],
      "addressment": []
    },
    "_prpt_": "amelia watson, blonde hair, blue eyes, medium hair, twin low buns, short twin braids, bangs, ahoge, tareme, medium breasts",
    "outfit": "deerstalker, plaid capelet, brown vest, white shirt, brown pleated skirt, single thighhigh, brown boots"
  },
  "ego_01": {
    "names": ["The Casual Ame"],
    "_prpt_": "amelia watson, blonde hair, blue eyes, short hair, bob cut, bangs, ahoge, tareme, medium breasts",
    "outfit": "white shirt, brown vest, rolled sleeves, brown pleated skirt, single thighhigh, brown boots"
  }
}
```

### Schema Rules:
- **`default`**: Master identity definition containing full fields (`names`, `associate`, `hazardLevel`, `taxonomy`, `_prpt_`, `outfit`).
- **`ego_##`**: Delta overrides containing only overridden properties.
- **Dynamic Resolution**: Never hardcode variant labels; resolve display names dynamically from `names[0]`.

---

## 10. Master UI/UX Code Logic & Design Pattern Tree

```markdown
# UI/UX Engineering System & Code Logic Tree
│
├── 🧱 DOM & Hitbox Layout Logic (Structural Geometry)
│   ├── Monolithic 100% Vertical Fill Pattern
│   │   ├── Container Constraint: Hardcoded min-height & height (60px / 48px / 44px)
│   │   ├── Zero-Padding Invariant: Container padding-top: 0 & padding-bottom: 0 (No dead zones)
│   │   ├── Child Input Stretch: <input> height: 100% !important; line-height: inherit; flex: 1 1 0%
│   │   └── Direct Click Proxy: Container onClick routes focus to inner input ref
│   │
│   ├── Full-Surface Target Law (Boundary Container Strategy)
│   │   ├── 100% Surface Trigger: Entire container acts as primary action (onClick, cursor-pointer)
│   │   ├── Visual State Cue: Immediate hover & active feedback (hover:bg-hazard-card/50, hover:border-hazard-border)
│   │   ├── Event Propagation Barrier: Nested sub-actions execute e.stopPropagation() to prevent triggering parent
│   │   └── Full-Row Hitbox: List & directory items enforce 100% width and height clickability
│   │
│   └── Notion-Grade Inline Ghost Input Pattern
│       ├── Idle State: Transparent background, zero border, matches surrounding typography
│       ├── Focus / Active State: Full 44px cell expansion, subtle ring highlight, no layout shift
│       └── Auto-Save Binding: Debounced or onBlur state commit directly to memory store
│
├── 🌲 TreeView & Hierarchical Outliner Pattern
│   ├── Indentation Rail: Absolute/computed left guides per depth level (padding-left: calc(depth * 1.25rem))
│   ├── Disclosure Caret: Kinetic rotation (0deg -> 90deg, transition-transform 200ms)
│   ├── Decoupled Hitboxes: Row select vs. branch expansion vs. hover action rails
│   └── Trailing Action Rail: Floating ghost controls (opacity-0 group-hover:opacity-100, e.stopPropagation())
│
├── 🎨 CSS Specificity & Cascade Invariants
│   ├── Host Application Reset
│   │   └── Root isolation: .hazard-trigger-studio-root * { box-sizing: border-box !important; }
│   ├── Specificity Override Matrix (Defeating Host Application 0,2,0 Defaults)
│   │   ├── Dark Mode Target: .theme-dark .hazard-trigger-studio-root input[...] (Specificity 0,3,0 + !important)
│   │   └── Light Mode Target: .theme-light .hazard-trigger-studio-root input[...] (Specificity 0,3,0 + !important)
│   └── Tokenized Component Sizing
│       ├── Tier 1 (Command Bar): .search-bar-monolith (60px) + .search-input-command (60px)
│       ├── Tier 2 (Secondary Search): .search-input-lg (48px–52px)
│       ├── Tier 3 (Ghost Table & Tree Cells): .notion-input (44px)
│       └── Tier 4 (Prompt Textareas): min-h-[100px] to min-h-[140px] with generous padding
│
├── 🎬 Kinetic Motion & Physics Engine
│   ├── Hardware Compositing & Stacking Layers
│   │   ├── High-Z Overlay: z-50 for all modal and drawer surfaces
│   │   └── GPU Acceleration: will-change: transform; transform: translate3d(...)
│   ├── Slide Transition Easing
│   │   ├── Curve: cubic-bezier(0.16, 1, 0.3, 1) (fluid kinetic deceleration)
│   │   ├── Duration: 300ms transition-all
│   │   ├── Active Enter: translate-x-0
│   │   └── Idle / Exit: translate-x-full
│   ├── Backdrop Decoupled Opacity Curve
│   │   ├── Opacity Fade: transition-opacity duration-300
│   │   └── Visual Blur: backdrop-blur-xs bg-black/60
│   └── Tactile Micro-Interactions
│       ├── Click Deflection: active:scale-95 or active:scale-[0.98]
│       └── Hover Lift: hover:scale-[1.01] with hover:brightness-110
│
├── 🧠 State & Data Synchronization Logic
│   ├── Decoupled Indexing (Lightweight Metadata Indexing vs. Lazy Ingestion)
│   │   ├── Mount Phase: Scan filesystem paths & filenames only (O(N) memory-safe for 1,500+ items)
│   │   └── Selection Phase: Read file body & parse JSON on-demand (O(1) runtime memory profile)
│   ├── Delta Inheritance & Override Engine
│   │   ├── Master Identity: Base entity schema (default key in JSON)
│   │   ├── Variant Delta Merge: ego_## partial overrides merged over default base
│   │   └── Fallback Safety: Missing delta keys seamlessly inherit base default properties
│   └── Atomic Disk Persistence
│       ├── In-Memory Validation: Clone structure -> apply delta changes -> validate integrity
│       └── File Write Adapter: Atomic JSON serialization without intermediate corruption
│
└── 🔍 Instant Search & Jump Mechanics
    ├── Real-Time Client-Side Filter
    │   ├── Case-insensitive query tokenization
    │   └── In-memory filter over lightweight index cache (Zero latency)
    ├── Monolithic Focus Trigger
    │   └── Container wrapper click event proxies to searchInputRef.current?.focus()
    └── Search Query Reset Barrier
        └── Clear action (X icon) resets state with e.stopPropagation() and maintains input focus
```
