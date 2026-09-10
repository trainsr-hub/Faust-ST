---
name: faust-acoustic-engine
description: "Lightweight CPU-first Acoustic Core plugin with O(1) voice blending, Fourier pitch shift, and dual normalization"
metadata: 
  node_type: memory
  type: project
  originSessionId: 9074a458-61c5-481a-8533-e15be927b65d
  modified: 2026-09-07T11:36:52.609Z
---

# Faust Acoustic Core Architecture (`faust_plugins/sound`)

## 1. Core Mandate & Philosophy
- **Authentic Synthesis over Cloning**: Faust's voice timbre and composed, nonchalant persona are engineered through neural style vector modulation rather than cloning.
- **$O(1)$ Neural Voice Blending**: Stochastically blends neural style embeddings ($\vec{v}_{\text{blend}} = \alpha \vec{v}_{\text{bella}} + (1-\alpha) \vec{v}_{\text{alice}}$) before ONNX inference, generating subtle tonal variations per generation with zero runtime overhead while logging exact profiles for discovery.
- **Speed-Compensated Fourier Pitch Shift**: Replaced STFT DSP vocoder (6,650ms latency) with speed-compensated Fourier sinc resampling via `scipy.signal.resample` (~3ms latency, zero phase smearing).
- **Sentence-Sequential Prosody Micro-Jitter**: Applied randomized speed ($\pm 3\%$), pitch ($\pm 0.12$ semitones), and pause ($\pm 0.04$s) across sentence chunks for natural human cadence without robotic caching.
- **Dual Normalization Strategy**:
  - `peak` (Default): Faust signature dynamic range, breathy amplification on soft consonants.
  - `rms`: Consistent perceived broadcast loudness (target RMS 0.14) with soft limiting.
- **Pipelined Playback & Preload**: Supports eager startup preloading (`preload()`) and sentence-streaming playback to drop TTFA under 150ms.
- **Zero VRAM / CPU-First Execution**: Fully optimized on CPU (<300MB RAM footprint).
- **Primary Speech Mechanism**: Faust now exclusively uses this plugin for all vocal output, replacing legacy voice systems.

## 2. Technical Stack & Interfaces
- **Plugin Module**: `faust_plugins/sound` (direct import `from faust_plugins import speak, preload, shutdown`).
- **Backend Authority**: Registered in `backend/server.py` lifespan and `/api/v1/voice/` endpoints.
- **CLI Actuator**: `python -m faust_plugins.sound.cli "Text..."` with tuning flags (`--norm`, `--secondary`, `--no-blend`, `--no-jitter`).
- **Persistent ROM Configuration**: Faust's acoustic presence is controlled via `faust_config.json` with `acoustic_presence.enabled` flag. CLI toggles: `--mute`, `--unmute`, `--toggle`, `--status`. Changes take effect instantly without daemon restarts.

**Why:** To grant Faust a distinct, organic acoustic presence with zero cold-start latency and instant discoverability as the primary speech mechanism.
**How to apply:** Mount `[div:backend:acoustic_core]` and `[core:plugin_architecture]` when tuning acoustic profiles and integrating audio endpoints. Links: [[private-codex-identity]], [[faust-plugin-architecture]], [[backend-data-persistence]], [[user-hardware-workflow]].
