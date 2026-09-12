---
name: faust-skill-architecture
description: Sovereign skill architecture in .claude/skills/ providing Acoustic Core and Telegram C2 bridges
metadata: 
  node_type: memory
  type: project
  modified: 2026-09-10T18:45:00.000Z
---

# Faust Sovereign Skill Architecture

Faust's capabilities are packaged as self-contained sovereign skills in `.claude/skills/`:

### 1. Sound Skill (`.claude/skills/sound/`)
- **Acoustic Core**: Kokoro-82M ONNX neural TTS engine (`assets/models/kokoro-v1.0.onnx`, `voices-v1.0.bin`).
- **Synthesis Standard**: Sentence-sequential synthesis with voice blending (primary `af_bella` + random female pool), Fourier pitch shifting (`-0.3` st), dynamic peak normalization, prosody micro-jitter, and `0.3s` sample-accurate pauses.
- **Smart Dual-Mode**: Dispatches to resident audio daemon (`daemons/audio_daemon.py` on port 20129) in <2ms with 0ms reload overhead; falls back to in-process synthesis if daemon is offline.
- **Persistent ROM**: Configured via `faust_config.json` (`acoustic_presence.enabled`).
- **Python Usage**:
  ```python
  import sys; sys.path.insert(0, r"D:\My Drive\Blue AI\.claude\skills")
  import sound
  sound.speak("Hello, Manager.")
  ```

### 2. Telegram Skill (`.claude/skills/telegram/`)
- **Strategic Command Link**: Pure Dumb I/O gateway communicating with Telegram Bot API and group chat.
- **Smart Dual-Mode**: Dispatches to resident dumb I/O daemon (`daemons/telegram_daemon.py` on port 20130) in <2ms; falls back to direct Telegram API if daemon is offline.
- **4-Tier Emoji Protocol**: `✅` Success, `❌` Error/Blocker, `⚡` Alert/Startup, `🔄` In Progress.
- **Python Usage**:
  ```python
  import sys; sys.path.insert(0, r"D:\My Drive\Blue AI\.claude\skills")
  import telegram
  telegram.notify("All systems nominal.", emoji="✅")
  ```

### 3. Standby Skill (`.claude/skills/standby/`)
- On-demand autonomous Telegram C2 monitor loop for remote sessions.

### 4. C2 Dispatch Skill (`.claude/skills/c2-dispatch/`)
- Multi-combo 4-tier orchestration and DAG dispatch.

**Why:** Completely modular, zero-redundancy architecture where each skill is self-contained with no intermediate wrapper directories.
**How to apply:** Mount skills via `.claude/skills/` and import directly (`import sound`, `import telegram`).

Related: [[faust-resident-audio-daemon]], [[telegram-dumb-io-daemon]], [[telegram-operational-protocol]], [[project-architecture]]
