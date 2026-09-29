---
name: master-ui-ux-template
key: div:ui:master_template
keys:
  - div:ui:master_template
  - div:ui:*
  - core:codex
description: "Master UI/UX template and zero-dead-zone design system at .claude/templates/ui/ with lazy-read evaluation and Single-Active-Branch Outliner"
metadata:
  node_type: memory
  type: project
  modified: 2026-09-28T00:00:00.000Z
---

## Master UI/UX Template & Zero-Dead-Zone Design System

Housed at `.claude/templates/ui/` and synced continuously across workstations via Google Drive.

### Operational Doctrine & Workflow
1. **Universal Mandate**: Whenever Faust or sub-agents design or construct any frontend, data-entry, or outliner interface, this Master Template is the mandatory ground-truth foundation.
2. **Lazy-Read Evaluation Invariant**:
   - Faust **always acknowledges** that this UI/UX template exists and governs all UI/UX design.
   - Faust **only reads** the template files (`.claude/templates/ui/`) when actively building UI/UX, modifying frontend components, or requiring specific architectural/CSS references. Faust never reads or scans these files during routine, non-UI turns.
3. **Continuous Evolution**: The template is modular and grows over time. As the Manager provides new UI patterns, input blocks, or ideas, Faust updates and expands the template in place.
4. **Theme Extensibility**: Soft-coded tokens (`data-theme="dark"|"light"`) decouple layout from skinning, enabling instant theme customization (Gate of Babylon, Obsidian, Amber Monochrome) without touching component logic.

### Architectural Invariants
1. **Universal Zero-Dead-Zone Delegation**:
   - Every non-functional surface (padding, background whitespace, field labels, field hints, zone containers) functions as an immediate section collapse/expand toggle.
   - Functional controls are strictly exempted via `INTERACTIVE_ELEMENTS_SELECTOR`.
   - Text fields strictly enforce `cursor: text !important` and `user-select: text !important`.
   - 80ms timestamp debouncing prevents double-toggle race conditions.
2. **Single-Active-Branch Outliner (`RAW_RULE.md`)**:
   - Zone 1 (Determined Past Spine): Linear ancestor lineage from Root to Parent, anchored by the Active Focal Node at the apex, collapsible into a single summary bar.
   - Zone 2 (Forward Choice Pathways): Clamped to $(n+3)$ depth with dual **Select Mode** (100% clickable choice cards + subpathway trays) and **Edit Mode** (ghost inputs + add/delete controls).
3. **The 7 Sovereign Data Entry Blocks**:
   - Block 1: Raw Text & Textarea
   - Block 2: Raw Searcher (Instant Command Bar)
   - Block 3: Notion-Style Single Select (Persistent suggestions + inline create)
   - Block 4: Notion-Style Multi-Select (Persistent tag pool + inline chip creation)
   - Block 5: Full-Surface Toggle Switches (Fitts's Law 100% card hitbox)
   - Block 6: Full-Surface Checkboxes (Full-row click hitbox)
   - Block 7: Single-Active-Branch Outliner
   - Sticky Live State Inspector (Two-way reactive JSON synchronizer)

**Why:** Ensures all Faust interfaces adhere to extreme ergonomic polish (Fitts's Law, zero dead zones, single-branch focus) without bloating routine context windows or locking the UI into a rigid visual theme.

**How to apply:** When assigned a UI/UX task, acknowledge the template, inspect `.claude/templates/ui/`, extract the required components or token patterns, and apply them directly.
