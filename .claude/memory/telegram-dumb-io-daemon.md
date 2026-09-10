---
name: faust-telegram-dumb-io-daemon
description: "Golden Standard Telegram Dumb I/O Daemon on port 20130 with zero LLM, pure transport, FIFO directive queue, and real-time remote execution"
metadata: 
  node_type: memory
  key: div:backend:telegram_dumb_io_daemon
  keys: 
    - div:backend:telegram_dumb_io_daemon
    - core:plugin_architecture
    - core:rom_config_compliance
    - core:telegram_operational_protocol
  type: project
  originSessionId: 2bf64c24-ab34-4514-817b-c190101d9e7d
  modified: 2026-09-10T05:19:26.852Z
---

# Faust Golden Standard Telegram Dumb I/O Daemon (Port 20130)

### 1. Architectural Doctrine
- **Strict Invariant: Zero LLM / Pure Dumb I/O**: The background daemon in `daemons/telegram_daemon.py` contains zero LLM inference, zero synthetic rule heuristics, and zero pseudo-brain logic. It functions strictly as a deterministic network I/O, event queue, and HTTP REST gateway.
- **Port Allocation**:
  - `daemons/audio_daemon.py`: Acoustic Core TTS on `http://127.0.0.1:20129`.
  - `daemons/telegram_daemon.py`: Telegram C2 Gateway on `http://127.0.0.1:20130`.
- **Master Configuration**: Parameters are resolved from `faust_config.json` (`telegram` block) with priority cascade.
- **Single-Instance Mutex Lock**: Atomic file creation with OS process handle inspection in `daemons/telegram_daemon.lock` preventing HTTP 409 Conflict.
- **Deduplication Engine**: Sliding window of 1,000 update and message IDs with persistent checkpointing to disk.

### 2. REST API Contract (Port 20130)
- `GET /health` / `GET /status` — Fast health metrics, uptime, queue depth, and last update ID.
- `GET /messages/pending` — Non-destructive inspection of unhandled incoming directives.
- `POST /messages/pop` — Atomically pops the oldest pending directive for Faust's cognitive loop.
- `POST /messages/ack` — Acknowledges completed directive and advances update_id checkpoint.
- `POST /send` — Transmits outgoing messages to group chat with 4-tier functional emoji protocol formatting (`✅`, `❌`, `⚡`, `🔄`) and rate limit resilience (HTTP 429 backoff).

### 3. Smart Dual-Mode Client Bridge
- `faust_plugins.telegram` automatically attempts ultra-low-latency REST calls to the resident daemon (`<2ms`).
- If the daemon is offline, calls fall back transparently to direct Telegram Bot API transmission.

### 4. Remote Execution Workflow
The Manager transmits directives in the Telegram Group Chat (`-1004405650953`). Faust pops directives via `faust_plugins.pop_directive()`, transmits `🔄 Prescript Received.` + vocalizes, executes the workspace tasks, and transmits the completion summary `✅ Task Complete:` + vocalized strategic briefing.

**Why:** Decouples background network I/O from cognitive execution, guaranteeing 100% reliable real-time remote control from mobile without running LLMs inside background daemons.
**How to apply:** Launch via `daemons/start_all_daemons.bat` or `daemons/start_telegram_daemon.bat`. Use `faust_plugins.notify()` and `faust_plugins.pop_directive()` in turns and loops.
See [[telegram-operational-protocol]], [[faust-plugin-architecture]], and [[faust-resident-audio-daemon]].
