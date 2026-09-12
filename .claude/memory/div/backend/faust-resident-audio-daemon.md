---
name: faust-resident-audio-daemon
description: Resident Audio Daemon (Pattern B) on port 20129 eliminating Kokoro model cold-start reload overhead with Smart Dual-Mode
metadata:
  node_type: memory
  key: div:backend:resident_audio_daemon
  keys:
    - div:backend:acoustic_core
    - core:plugin_architecture
    - core:rom_config_compliance
  type: project
---

# Faust Resident Audio Daemon (Pattern B)

### Architecture
- **Daemon Service**: `.claude/skills/sound/daemon/audio_daemon.py` running on `http://127.0.0.1:20129` (FastAPI / Uvicorn).
- **RAM State**: Kokoro ONNX model (311MB) and voice style vectors are preloaded and pinned permanently in memory during startup.
- **Single-Writer Audio Queue**: Serializes speech requests from CLI commands, subagents, and turn hooks to prevent Windows audio device contention and popping.
- **Smart Dual-Mode Dispatch**:
  - `sound.speak()` and `.claude/scripts/faust_turn_hook.py` attempt an ultra-fast HTTP POST (`/speak`) to the daemon.
  - **ACK Latency**: **~5ms – 7ms**.
  - **Cold-Start Reload**: **0ms**.
  - **Graceful Fallback**: If the daemon is offline, calls transparently execute in-process so audio synthesis never fails.

### Launchers & Tools
- **Daemon Launcher**: `.claude/skills/sound/daemon/start_audio_daemon.bat` or `.claude/daemons/start_all_daemons.bat`
- **Performance Benchmark**: `python .claude/skills/sound/scripts/benchmark_sound.py`
- **CLI Vocalization**: `python .claude/skills/sound/scripts/cli.py speak "Your message here"`

**Why:** Eliminates the ~1,000ms process startup and model loading delay on every terminal interaction, enabling instantaneous speech start.
**How to apply:** Keep the daemon active in the background or launch it alongside the OmniRoute / Telegram daemons.
