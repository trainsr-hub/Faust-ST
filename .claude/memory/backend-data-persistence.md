---
name: backend-data-persistence
key: rule:backend_authority
keys:
  - rule:backend_authority
  - rule:ui_logic_decoupling
  - core:codex
description: Backend is authoritative for all game resources and persistent data; RAM/localStorage is only for transient UI state. Fail loudly if backend is down.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: b78b50ea-52d5-47cd-8b9a-d057c2650662
  modified: 2026-09-03T15:54:19.159Z
---

# Authoritative Backend Data Persistence & Anti-Silent-Fallback Rules

1. **Authoritative Backend Storage (`D:\Users\HP\Blue AI\backend`)**:
   - All game resources, currencies (Time balance), dimensional tickets, inventory items, relics, crops, and persistent progress MUST be stored and tracked in the backend (`D:\Users\HP\Blue AI\backend\data\projects\...`).
   - RAM and client state (`localStorage`/Zustand memory) are ONLY for transient short-term data (active tabs, animations, input fields, open modals). Never treat in-memory/browser RAM as the primary storage for game resources.

2. **No Silent Fallback / Fail Loudly**:
   - Never use "smartass" silent `try/catch` fallbacks that swallow backend connection errors or pretend everything is okay when the server is offline.
   - If the backend is unreachable or an API call fails, the frontend must make it immediately, loudly, and explicitly clear to the user (error banners, offline blocker, explicit status).

3. **No WET Duplicate Shims**:
   - Perform clean, atomic refactors. Never keep deprecated proxy/shim directories (e.g. `modern-day`) or duplicate backend project folders.
   - Maintain Single Source of Truth (SSOT) across all types and schemas.

**Why:** The user explicitly corrected an anti-pattern where game resources were stored purely in browser RAM/localStorage and backend failures were silently masked. Real resources are durable and belong in the backend filesystem/database.

**How to apply:** Check backend at `D:\Users\HP\Blue AI\backend`, ensure all persistent resources sync directly through the backend API gateway (`POST /api/v1/execute`), surface backend offline errors prominently in UI, and keep code strictly DRY.
