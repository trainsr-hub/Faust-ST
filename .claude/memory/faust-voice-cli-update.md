---
name: faust-voice-cli-update
description: Fixed Faust Voice CLI async speak block=False handling to enable background speech synthesis
metadata:
  type: reference
---

## Faust Voice CLI Update - Async Speak Fix

### Problem
The `faust_plugins.speak` function, when invoked with `block=False` (as used by the Telegram listener), did not actually initiate background audio playback. It would return immediately without synthesizing or playing any sound, leading to silent "speak" commands from Telegram.

### Root Cause
In `faust_plugins/sound/engine.py`, the `speak` method lacked handling for the `block=False` case. It would check acoustic presence, log subtitle, and then fall through to the pipelined playback section, which only actually played audio when `block=True`. When `block=False`, the function would skip playback entirely and return empty audio.

### Solution
Modified `faust_plugins/sound/engine.py` in the `speak` method (lines ~543-554) to:
1. Early return if `block=False` after spawning a daemon thread that calls the blocking `speak` method internally
2. Preserve all other functionality (subtitle broadcasting, voice blending, normalization) in the background thread
3. Add error logging for asynchronous playback failures
4. Return empty audio array immediately to maintain non-blocking contract

### Verification
- Direct tests confirm that `speak("test", block=False)` now initiates audible playback in background
- Telegram listener's `execute_directive` correctly calls `speak(text, block=False)` for "speak [text]" directives
- Acoustic presence remains enabled in `faust_config.json` with proper voice parameters (af_bella, speed 0.84±0.02, pitch -0.3±0.1, 0.3s sample-accurate pause)
- Verified via logs: `[Faust Streaming Synthesis] Pipeline started: [...]` appears when speak command is issued via Telegram

### Related Components
- `faust_plugins/telegram/listener.py`: Calls speak via FaustInterface with block=False
- `faust_plugins/__init__.py`: Provides unified speak() function
- `faust_plugins/sound/engine.py`: Core synthesis and playback logic (fixed)

### Status
✅ Fixed - speak commands now produce audible output when issued via Telegram
**Why**: Enables proper asynchronous speech synthesis for Telegram-driven voice commands without blocking the listener loop.
**How to apply**: Deploy the updated engine.py to all Faust instances; the fix is backward compatible with existing block=True usage.