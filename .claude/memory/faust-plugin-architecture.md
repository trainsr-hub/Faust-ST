---
name: faust-plugin-architecture
description: Modular plugin framework and self-contained sound plugin for Faust with high-level zero-friction Python API
metadata: 
  node_type: memory
  type: project
  originSessionId: 575cdd23-d5a2-4c04-a3a1-8c317b273bc1
  modified: 2026-09-07T11:37:33.992Z
---

Faust Plugin Architecture provides a unified, self-contained plugin system in `.claude/skills/`.

### Sound Plugin (`.claude/skills/sound/`)
- **Primary Vocal Actuator**: Standardized as the sole acoustic engine for Faust across all sessions and agent interactions.
- **Self-Contained**: Houses its own model binaries in `.claude/skills/sound/assets/models/` (`kokoro-v1.0.onnx`, `voices-v1.0.bin`).
- **Synthesis Standard**: Sentence-sequential Kokoro-82M ONNX synthesis with $O(1)$ voice blending (e.g. `af_bella` + `bf_alice`), speed-compensated Fourier pitch shifting (`-0.3` st), dynamic peak/RMS normalization, per-chunk prosody micro-jitter, and `0.3s` sample-accurate pauses.
- **Persistent ROM Configuration**: Faust's acoustic presence is controlled via `faust_config.json` with `acoustic_presence.enabled` flag. CLI toggles: `--mute`, `--unmute`, `--toggle`, `--status`. Changes take effect instantly without daemon restarts.
- **Direct Usage**:
  ```python
  from sound.scripts import speak, preload, shutdown
  speak("Hello, Manager.")
  ```
  Or from the submodule / CLI:
  ```python
  from sound.scripts.engine import get_engine
  engine = get_engine()
  engine.speak("Hello, Manager.")
  ```
  ```bash
  python .claude/skills/sound/scripts/cli.py "Status report ready, Manager."
  ```

### Telegram Plugin (`.claude/skills/telegram/`)
- **Strategic Communication Channel**: Provides secure, real-time notification and command execution via Telegram Bot API.
- **Self-Contained**: Includes configuration (`assets/telegram_config.json`), smart listener (`scripts/listener.py`), notification utility (`scripts/notify.py`), and backward compatibility wrappers.
- **4-Phase Operational Protocol**:
  - *Phase 1 (Startup)*: "Faust online. Strategic command link established."
  - *Phase 2 (Intake Acknowledgment)*: "Prescript Received." (dispatched upon command intake)
  - *Phase 3 (Active Execution)*: Silent execution with zero synthetic progress spam
  - *Phase 4 (Completion/Blockage Report)*: HTML-formatted concrete technical summary or alert
- **Direct Usage**:
  ```python
  from telegram.scripts import notify, send_telegram
  notify("Operational status: All systems nominal.")
  ```
  Or from the submodule / CLI:
  ```python
  from telegram.scripts.notify import send_message
  # Load config to get bot_token and chat_id
  import json
  from pathlib import Path
  config_path = Path(".claude/skills/telegram/assets/telegram_config.json")
  with open(config_path, 'r') as f:
      config = json.load(f)
  bot_token = config.get("bot_token")
  chat_id = config.get("chat_id")
  send_message(bot_token, chat_id, "Task completed successfully.")
  ```
  ```bash
  python .claude/skills/telegram/scripts/notify.py "Backup completed at 03:00 AM"
  ```

**Why:** Gives the Manager and Faust agents zero-friction access to secure communication channels for alerts, status updates, and remote command execution.
**How to apply:** When adding new capabilities (e.g. notifications, automation, vision), structure them as independent folders under `faust_plugins/<name>/` and wire them into `faust_plugins/__init__.py`.

Related memories: [[faust-acoustic-engine]], [[sentence-sequential-synthesis-lesson]], [[telegram-setup-complete]], [[project-architecture]]
