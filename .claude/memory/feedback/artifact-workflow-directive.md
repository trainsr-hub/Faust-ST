---
name: artifact-workflow-directive
description: Artifacts are archived; always use skills + Manager templates for UI/UX
metadata:
  type: feedback
---

# Artifact Workflow Directive

## Manager's Vision

1. **Artifacts → Archived Folder**
   - Artifacts are published to claude.ai but archived/skipped by Faust for daily operations
   - Not part of the core workflow focus
   - Use when needed, but don't treat as primary

2. **Skills are Community Guidance** (When Building UI/UX)
   - `ui-ux-pro-max` skill = searchable design intelligence
   - 79 styles, 192 palettes, 74 font pairings, 119 UX guidelines
   - Provides supplementary guidance and pattern matching

3. **Manager-Approved Designs are Authority** (When Building UI/UX)
   - `D:\My Drive\Blue AI\.claude\templates\ui\` = Master UI/UX Template
   - Independent sovereign design system
   - Changes frequently - must remain independent
   - Mandatory reference when building any UI/UX

## Correct Workflow for UI/UX Tasks

```
UI/UX Task Initiated
    ↓
Load /ui-ux-pro-max skill (community guidance)
    ↓
Load /artifact-design skill (if publishing)
    ↓
READ Master Template at D:\My Drive\Blue AI\.claude\templates\ui\
    ↓
Apply template patterns (Zero-Dead-Zone, Hazard Studio tokens, etc.)
    ↓
Query skill for supplements (palettes, fonts, UX guidelines)
    ↓
Build UI/UX using template + skill guidance
    ↓
Publish as artifact if meant for other people/persistent use
    ↓
Archive artifact (skip in daily Faust operations)
```

## Why This Architecture

- **Skills** = Community best practices, searchable database
- **Templates** = Manager's self-approved, sovereign, frequently-changing design system
- **Artifacts** = Archived, not core workflow focus
- **Master Template** = Single source of truth for UI/UX patterns

## Key Invariants

- Always read Master Template FIRST when building UI/UX
- Never skip the template because it's "just custom CSS"
- Skills supplement the template, never replace it
- Manager-approved designs take precedence over skill recommendations

**Why:** The Master Template is your self-approved design system. It must never be lost, always be respected, and remain independent because it evolves frequently.
