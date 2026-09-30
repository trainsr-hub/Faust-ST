# Mock — Phase 2 Wardrobe Studio

Standalone dev workspace. Build and test UI components independently before integrating into the plugin.

---

## Structure

```
Mock/
├── README.md
├── components/
│   └── Mannequin.html      ← SVG body silhouette, color-coded coverage per layer
└── pages/
    (empty — full studio page comes after components are approved)
```

---

## Components

### `components/Mannequin.html`
Isolated mannequin body component. Tests the core visual: body zones lighting up in the active layer's color when clothing is equipped.

- **Zones:** Head, Neck, Torso, Arms, Waist, Legs, Feet
- **Layer colors:** Outer (pink), Mid (amber), Base (blue), Underwear (green)
- **Controls:** Layer selector + zone toggle buttons

---

## Roadmap

1. ✅ Mannequin — color-coded body coverage
2. ⬜ Hitbox Grid — 3-column tree (combo → standard → specific)
3. ⬜ Item Popup — click cell → select item
4. ⬜ `pages/wardrobe-studio.html` — full integration
