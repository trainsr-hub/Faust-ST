---
name: telegram-unified-engine-architecture
description: Unified dual-threaded daemon architecture for Faust Telegram command link and execution engine
metadata: 
  node_type: memory
  type: reference
  originSessionId: 91e08b23-53cd-43eb-9ed7-02a17dae87f0
  modified: 2026-09-07T06:22:30.669Z
---

# Telegram Unified Engine Architecture

The background Telegram listener and directive executor are unified into a single persistent daemon in [telegram_smart_listener.py](telegram_smart_listener.py).

### Architectural Breakdown
1. **Thread 1 (Ingress Poller)**:
   - Polls `getUpdates` with update offset management and exponential backoff on HTTP 409 conflicts.
   - Enforces group chat authentication (`-1004405650953`).
   - Appends raw records to `telegram_incoming.jsonl`.
   - Pushes directives to an in-memory thread-safe `queue.Queue`.
2. **Thread 2 (Executive Worker)**:
   - Reads directives from the queue.
   - Dispatches `Prescript Received.` strictly upon dequeuing and commencing execution.
   - Executes the operational handler (`execute_directive`).
   - Dispatches structured completion report or error blocker alert via Telegram.
   - Saves checkpoint in `processed_update_id.txt` to eliminate duplicate runs across restarts.
3. **Process Mutex**:
   - Single Win32 mutex lock via `telegram_smart_listener.lock` prevents orphan or multi-instance race conditions.

**Why:** Eliminates the detachment defect where `Prescript Received.` was sent without active background processing or where separate worker processes failed to launch.
**How to apply:** Always run `telegram_smart_listener.py` as the singular authoritative command link daemon.
