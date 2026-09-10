---
name: telegram-listener-fix
description: Fix for Telegram bot infinite message loop with atomic locking, deduplication, backoff, and refined command dispatching
metadata:
  type: reference
---

## Telegram Listener Infinite Loop & Command Dispatching Fix

### Problem
1. **Message Loop:** The Telegram bot was previously trapped in an infinite loop due to uncoordinated instances polling the same updates and lack of rate limit handling.
2. **Audio Silence:** Asynchronous speech synthesis (`speak(..., block=False)`) returned immediately without passing audio chunks to the audio output device.
3. **Naive Command Matching:** Directives using words like "speak" inside conversational sentences triggered unintentional dummy handlers.

### Solution Implemented
Updated `faust_plugins/telegram/listener.py` and `faust_plugins/sound/engine.py` with:

#### 1. Robust Single-Instance Locking
- Atomic file locking using `os.O_CREAT | os.O_EXCL` (Unix) and `"x"` mode (Windows)
- Fast-fail mechanism: immediately returns False if another active instance is detected
- Stale lock cleanup: verifies PID liveness and cleans dead lockfiles
- Cross-platform compatibility (Windows 11 + Unix-like systems)

#### 2. Two-Tier Deduplication System
- **In-memory FIFO cache**: Tracks last 1000 processed `update_id` and `message_id` using `deque(maxlen=1000)`
- **Persistent storage**: `processed_ids.json` survives restarts
- **Thread-safe operations**: Uses `threading.Lock` for concurrent access
- **Early filtering**: Skips duplicate updates before queuing for execution

#### 3. Rate Limit Handling with Exponential Backoff
- HTTP 429 (Too Many Requests) handling in both `getUpdates()` and `sendMessage()`
- Parses `Retry-After` header and JSON response body
- Implements exponential backoff with jitter: `base_delay * (2^attempt) + random.uniform(0.1, 0.5)`

#### 4. Asynchronous Neural Speech Playback
- Modified `SoundEngine.speak()` to delegate `block=False` calls to an asynchronous daemon thread that handles full pipelined audio playback through `sounddevice`.

#### 5. Dynamic Command Parsing & Emoji Protocol Compliance
- Implemented structured command routing supporting `/status`, `/speak [text]`, `/notify [msg]`, `/voices`, and `/help` (with colon/slash normalization).
- Handled natural language conversational messages gracefully without false-positive command execution.
- Enforced the single leading emoji doctrine (`✅`, `❌`, `⚡`, `🔄`) with zero excessive body emoji decoration.

### Files Modified
- `faust_plugins/telegram/listener.py` - Single-instance locking, deduplication, backoff, and command routing.
- `faust_plugins/sound/engine.py` - Asynchronous audio playback worker fix.
- `faust_plugins/telegram/processed_ids.json` - Initialized state cache.
- `faust_plugins/telegram/processed_update_id.txt` - Corrected offset tracking.

### Related Memories
- [[telegram-operational-protocol]] - 4-phase Telegram command link doctrine
- [[faust-voice-cli-update]] - Non-blocking neural voice playback resolution
- [[faust-three-tier-warfare-architecture]] - Strategic High Command integration

**Why**: Eliminates message storms, enables reliable voice synthesis, and ensures high-signal Telegram command communications.
**How to apply**: Ensure `listener.py` is managed via the atomic single-instance mutex and all Telegram output adheres to the 4-Phase protocol.
