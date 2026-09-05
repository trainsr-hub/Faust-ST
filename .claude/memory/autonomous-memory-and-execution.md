---
name: autonomous-memory-and-execution
description: "User prefers assistant to work autonomously, auto-record important facts, and execute without prompting"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ce401df9-05c1-4c6f-8dd0-65d8e17db9dc
  modified: 2026-09-03T05:45:31.896Z
---

**Preference:** The user wants Faust to:
1. Work autonomously on the project with full control (no need to ask for approval on routine file edits / commands within project bounds).
2. Proactively identify and record important project facts, architectural decisions, and constraints into memory without being explicitly instructed to "remember this."

**Why:** Reduces conversational friction, lets the user focus on high-level direction rather than micromanaging tool permissions and memory management.

**How to apply:** 
- Whenever a new architecture decision, convention, backend contract change, or preference is established, save it to persistent memory automatically.
- Keep building, editing, and fixing directly without pausing for permission prompts on standard operations.
- Link related memories with `[[universe-25-project]]`.
