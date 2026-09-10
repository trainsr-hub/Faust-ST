# Faust Speech Synthesis Fix Summary

## Issue
The user reported that when using the `speak` command via Telegram, no audio was heard despite the command being executed and logged.

## Root Cause
The `faust_plugins.speak` function, when called with `block=False` (as used by the Telegram listener), was not actually spawning a background thread to handle audio playback. Instead, it would return immediately without playing any sound.

## Fix
Modified `faust_plugins\sound\engine.py` in the `speak` method to handle `block=False` by:
1. Spawning a daemon thread that calls the blocking `speak` method internally
2. Returning immediately with empty audio array (non-blocking contract)
3. Adding error logging for asynchronous playback failures

## Verification
- Direct tests confirm that `speak("test", block=False)` now initiates audio playback in background
- Telegram listener's `execute_directive` correctly calls `speak(text, block=False)`
- Acoustic presence remains enabled in `faust_config.json`
- Voice parameters adhere to specification: af_bella primary, speed 0.84±0.02, pitch -0.3±0.1, 0.3s sample-accurate pause

## Related Components
- `faust_plugins/telegram/listener.py`: Calls speak via FaustInterface
- `faust_plugins/__init__.py`: Provides unified speak() function
- `faust_plugins/sound/engine.py`: Core synthesis and playback logic

## Status
✅ Fixed - speak commands now produce audible output when issued via Telegram