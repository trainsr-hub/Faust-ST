---
name: data-engine-architecture
description: "Blue Rose 5-tier SQLite data engine — tiers, databases, and ETL flow for music_app"
metadata: 
  node_type: memory
  type: project
  originSessionId: ffe2083a-0419-47af-bb5f-ab1992123631
  modified: 2026-09-03T08:07:00.505Z
---

## Blue Rose Storage Engine (Backend on port 8080)

All data lives under `reference/backend/data/projects/music_app/app_data/`.

### Tier Layout
| Tier | DB File | Purpose |
|------|---------|---------|
| Tier 1 | `_1_static.db` | Static metadata: titles, channel names, durations, thumbnails |
| Tier 2 | `_2_events.jsonl` | Streaming JSONL event buffer (user actions: upvote, downvote, block, etc.) |
| Tier 3 | `_3_state.db` | Aggregated score arrays (`score_3_count` to `score_7_count`) + arc counters |
| Tier 4 | `_4_display.db` | Projected display: computed `hazard_level`, `played`, `timeblock`, `unlock_date` |
| Tier 5 | `_5_config.db` | Engine configuration |
| System | `system/rawinfo.db` | Full raw info backup |
| System | `system/black_list.db` | Blacklisted track IDs |
| System | `system/bad_kpi_list.db` | Tracks purged for hazard < 2.0 |

### ETL Pipeline Flow
1. **T2 → T3**: Ingest events from buffer, aggregate into score arrays & arc counters, write blacklist entries, clear buffer
2. **T3 → T4**: Calculate hazard scores via logarithmic formula, project to display tier, purge bad KPI tracks (< 2.0)
3. **Exclude Violations**: Remove blacklisted + bad KPI IDs from `_1_static.db`

### Hazard Score Mathematics
- Raw XP: `rawXP = 10*s5 + 65*s6 + 200*s7 - 70*s3 - 3*s4`
- Scaling Coefficient: `c = 5.0 / ln(51) ≈ 1.2717`
- Score: `Hazard = 3.0 + sgn(rawXP) * c * ln(1 + |rawXP| / 300)`
- Eligibility: Score > 3.0 → Vault display (currently 59 active tracks)

### API Pattern
Single endpoint: `POST /api/v1/execute`
```json
{ "project_id": "music_app", "tier": "4", "order": { "action": "read_all" } }
{ "project_id": "music_app", "tier": "1", "order": { "action": "batch_read", "data": ["id1", "id2"] } }
```
Actions: `read_all`, `batch_read`, `batch_upsert`, `batch_delete`, `clear`, `seed_if_missing`

See [[project-architecture]] for full workspace layout.
