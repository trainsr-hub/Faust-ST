# Faust Acoustic Core

Faust's neural voice synthesis system using Kokoro-82M ONNX for natural, sentence-sequential speech with prosody jitter and voice blending capabilities.

## Overview

The Faust Acoustic Core provides:
- Kokoro-82M ONNX neural TTS engine (`kokoro-v1.0.onnx`, `voices-v1.0.bin`)
- $O(1)$ neural voice style blending (e.g., `af_bella` with randomized female pool)
- Speed-compensated Fourier sinc pitch shifting via `scipy.signal.resample`
- Sentence-sequential prosody micro-jitter (±3% speed, ±0.12 semitones pitch, ±0.04s pause)
- Pipelined streaming playback with sample-accurate silence pauses
- Persistent ROM configuration via `faust_config.json`

## Commands

### Core Functions

| Command | Description |
|---------|-------------|
| `faust-speak <text>` | Synthesize and play speech with current voice settings |
| `faust-voice-status` | Display current acoustic presence configuration |
| `faust-voice-toggle` | Toggle acoustic presence on/off |
| `faust-voice-tune` | Interactive voice parameter tuning utility |

### Scripts

All scripts are located in `.claude/skills/sound/scripts/` and can be invoked via Python:

- `python .claude/skills/sound/scripts/cli.py speak "<text>"` - Core speak function
- `python .claude/skills/sound/scripts/api.py` - REST API for external integration
- `python .claude/skills/sound/scripts/engine.py` - Direct engine access
- `python .claude/skills/sound/scripts/tune_faust_voice.py` - Interactive tuning

## Configuration

Voice settings are managed through `faust_config.json` in the project root under the `acoustic_presence` key:

```json5
{
  "acoustic_presence": {
    "enabled": true,
    "voice": "af_bella",
    "speed": 0.84,
    "pitch_shift": -0.3,
    "pause_duration": 0.3,
    "language": "en-us",
    "sample_rate": 24000,
    "peak_norm": 0.90,
    "speech_log_enabled": true,
    "speech_log_dir": ".claude/skills/sound/logs/speech",
    "websocket_subtitle_url": "ws://localhost:8082/ws/subtitle",
    "normalization_type": "peak",
    "voice_blend_enabled": true,
    "voice_blend_secondary": "random_female",
    "voice_blend_female_pool": [
      "bf_alice", "bf_emma", "bf_isabella", "bf_lily",
      "af_heart", "af_kore", "af_nicole", "af_nova",
      "af_river", "af_sarah", "af_sky", "af_alloy",
      "af_aoede", "af_jessica"
    ],
    "voice_blend_base_weight_mean": 0.85,
    "voice_blend_base_weight_var": 0.08,
    "voice_blend_min_base_weight": 0.70,
    "voice_blend_max_base_weight": 0.95,
    "prosody_jitter_enabled": true,
    "prosody_speed_jitter": 0.03,
    "prosody_pitch_jitter": 0.12,
    "prosody_pause_jitter": 0.04
  }
}
```

## Installation

This skill is self-contained within `.claude/skills/sound/` and requires no additional setup beyond ensuring the model files are present:
- `kokoro-v1.0.onnx` (in `assets/models/`)
- `voices-v1.0.bin` (in `assets/models/`)

## References

- [Normalization Test](references/NORMALIZATION_TEST.md) - Audio normalization verification
- [Proposed Improvements](references/PROPOSED_IMPROVEMENTS.md) - Planned enhancements
- [Test Improvements](references/test_improvements.py) - Validation suite

## Usage Examples

### Basic Speech Synthesis
```bash
python .claude/skills/sound/scripts/cli.py speak "Understanding confirmed; proceed to dispatch."
```

### Toggle Acoustic Presence
```bash
python .claude/skills/sound/scripts/cli.py toggle
```

### Voice Tuning
```bash
python .claude/skills/sound/scripts/tune_faust_voice.py
```

## Integration with Faust Systems

This skill integrates with Faust's turn hook system (`scripts/faust_turn_hook.py`) to provide:
- Automatic vocalization on `UserPromptSubmit` and `Stop` events
- Telegram milestone notifications via `faust_plugins.notify()`
- Persistent configuration management via ROM system