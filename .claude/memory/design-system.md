---
name: design-system
description: "Gate of Babylon imperial design system — colors, typography, VFX shaders, and rank tiers"
metadata: 
  node_type: memory
  type: project
  originSessionId: ffe2083a-0419-47af-bb5f-ab1992123631
  modified: 2026-09-03T08:07:22.763Z
---

## Gate of Babylon Design System

### Color Palette
- Imperial Gold: `#d4af37` (accent), `#ffd86b` (hover/glow), `#aa8214` (gradient end)
- Backgrounds: `#070609` (primary), `#0a080e` (secondary), `#120f18` (card), `#1a1424` (elevated)
- Text: `#f5f0e8` (primary), `#9c93a8` (secondary), `#685c78` (muted)
- Borders: `#2b2238` (default), `#524124` (hover/gold)
- Crimson: `#841822` (danger accent)

### Typography
- **Cinzel** — Headers, buttons, navigation (font-cinzel)
- **Cinzel Decorative** — Hero titles, decorative elements
- Imported via Google Fonts in `src/index.css`

### Key CSS Classes
- `.portal-backdrop` — Radial gradient page background
- `.golden-border-glow` — Gold hover glow on cards
- `.gold-text-gradient` — Gold gradient text effect
- `.btn-secondary` — Secondary button style
- `.shadow-gold-sm/md` — Gold box shadows
- `.app-visible` / `.app-hidden` — Keep-alive app mounting (display toggle)

### 15-Tier Rank System (defined in `src/utils/rank.ts`)
| Tier | Symbol | Threshold | Category |
|------|--------|-----------|----------|
| The Star | ✦ | ≥ 8.00 | Cosmic |
| Singularity | Ø | ≥ 7.50 | Cosmic |
| Abyss | Ψ | ≥ 7.00 | Cosmic |
| Apex | S₄ | ≥ 6.75 | Evolution |
| Molten | S₃ | ≥ 6.50 | Evolution |
| Resonant | S₂ | ≥ 6.25 | Evolution |
| Awakening | S₁ | ≥ 6.00 | Evolution |
| A+ | A+ | ≥ 5.50 | Standard |
| A | A | ≥ 5.00 | Standard |
| B+ | B+ | ≥ 4.50 | Standard |
| B | B | ≥ 4.00 | Standard |
| C+ | C+ | ≥ 3.50 | Standard |
| C | C | ≥ 3.00 | Standard |
| D+ | D+ | ≥ 2.50 | Decay |
| D | D | ≥ 2.00 | Decay |

### Procedural VFX Shaders (CSS keyframes in `src/index.css`)
- **✦ The Star**: `.vfx-star-corona-spin` — Rotating coronal SVG flares + solar radiance pulse
- **Ø Singularity**: `.badge-null` — Circular black hole with `.vfx-hawking-wave-1/2` (radiation pulse), `.vfx-penrose-ergosphere` (ergosphere ring), `.vfx-penrose-jets` (relativistic emission jets)
- **Ψ Abyss**: `.badge-psi` — `.vfx-tide-layer-1/2` (Unfrozen Tides SVG wave scroll)
- **S₁–S₄**: `.badge-s1` through `.badge-s4` — Energy pulse, sweep, flare, transmutation surge

See [[project-architecture]] for file locations.
