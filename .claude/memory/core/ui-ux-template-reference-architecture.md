---
name: ui-ux-template-reference-architecture
description: Skills reference templates (not absorb them) - templates remain independent because they change frequently
metadata:
  type: project
---

# UI/UX Template Reference Architecture

## Core Principle

**Skills REFERENCE templates, templates do NOT merge into skills.**

## Architecture

1. **Template Location**: `D:\My Drive\Blue AI\.claude\templates\ui\`
   - Status: Independent sovereign design system
   - Synchronized via Google Drive
   - Changes frequently - must remain independent

2. **Skill Location**: `D:\My Drive\Blue AI\.claude\skills\ui-ux-pro-max\`
   - Status: References the template via explicit pointer
   - Contains supplementary guidance (product palettes, font pairings, UX guidelines)

3. **Reference Flow**:
   ```
   UI/UX Task → Load ui-ux-pro-max skill → Read Master Template → Apply template patterns → Query skill for supplements
   ```

## Mandatory Protocol When Building UI/UX

1. **Always load** `/ui-ux-pro-max` skill first
2. **Always read** the Master Template before building:
   - `D:\My Drive\Blue AI\.claude\templates\ui\README.md`
   - `D:\My Drive\Blue AI\.claude\templates\ui\css\styles.css`
   - Reference template components as needed
3. **Apply template patterns**:
   - Zero-Dead-Zone delegation (every non-functional pixel toggles)
   - Single-Active-Branch outliner (Zone 1: Past + Zone 2: Future)
   - Hazard Studio design tokens and color palette
   - Fitts's Law 100% hitboxes
   - Proper modal scrolling patterns
4. **Then query skill** for supplementary guidance

## Why This Architecture

- **Templates change frequently** - they must remain independent
- **Skills provide stable reference** - they point to the live template
- **No duplication** - single source of truth for UI/UX patterns
- **No loss risk** - Manager's self-approved design system stays intact

## Related Memory

- `[core:ui-ux-template]` → Master UI/UX Template location and mandate
- `[core:skill_architecture]` → Sovereign skill system architecture
