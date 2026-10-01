# Portrait Forge

A lightweight, local-first anime portrait character creator. Customize skin tone, eye shape and color, hairstyle and color, expression, and accessories. Your active character and saved roster remain in your browser through LocalStorage.

## Run

Open `index.html` in a modern browser. No package installation or server is required.

## Features

- SVG-rendered portrait with layered, real-time customization
- JSON-driven catalog in `data/features.json`
- Save and restore a local character roster
- Random character generation
- Copyable text prompt for image-generation workflows
- JSON export for future integrations

## Project structure

- `index.html` — Application shell
- `styles/main.css` — Theme-aware responsive visual system
- `data/features.json` — Feature catalog
- `scripts/renderer.js` — SVG portrait renderer
- `scripts/app.js` — UI, state, controls, and exports
- `scripts/storage.js` — LocalStorage persistence boundary
