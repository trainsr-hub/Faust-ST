# Faust Sound Plugin (`faust_plugins/sound`)

Self-contained neural acoustic plugin for Faust's vocal presence.

---

## Key Capabilities & Architecture

- **$O(1)$ Neural Voice Style Blending**: Stochastically blends neural style embeddings ($\vec{v}_{\text{blend}} = \alpha \vec{v}_{\text{bella}} + (1-\alpha) \vec{v}_{\text{alice}}$) prior to ONNX inference with zero runtime computational overhead, logging mathematical recipes in real-time (e.g., `[af_bella*0.881 + bf_alice*0.119]`).
- **Speed-Compensated Fourier Pitch Shift**: Replaces CPU-heavy STFT vocoders (~6,650ms) with speed-compensated Fourier sinc resampling via `scipy.signal.resample` (~3ms latency, zero phase smearing).
- **Sentence-Sequential Prosody Micro-Jitter**: Evaluates sentence chunks sequentially with randomized speed ($\pm 3\%$), pitch ($\pm 0.12$ semitones), and pause ($\pm 0.04$s) to yield organic human cadence.
- **Dual Normalization Architectures**:
  - `peak` (Default): Dynamic range, breathy amplification on soft consonants and trailing phrases.
  - `rms`: Consistent broadcast loudness curve (target RMS 0.14) with soft limiting.
- **Pipelined Low-Latency Playback**: Employs sentence streaming to dispatch Chunk 1 to hardware playback while Chunk 2 synthesizes concurrently, driving Time-to-First-Audio under 150ms.
- **Obsidian-Style Startup Preload**: Eager model initialization and micro-warmup via `preload()` to eliminate cold-start latency entirely.
- **Persistent Subtitle Telemetry**: Background daemon thread consuming a thread-safe FIFO queue to broadcast subtitles to WebSocket clients (`ws://localhost:8082/ws/subtitle`) without per-call thread spawning.

---

## Directory Layout
```
faust_plugins/sound/
├── __init__.py            # Exported interface (speak, synthesize, preload, shutdown, list_voices)
├── config.py              # VoiceConfig dataclass, presets, and paths
├── engine.py              # Neural acoustic engine & SubtitleWorker
├── cli.py                 # Standalone CLI with tuning flags
├── api.py                 # FastAPI router & schemas
├── test_improvements.py   # Regression & capability test suite
├── README.md              # Technical documentation
└── models/
    ├── kokoro-v1.0.onnx   # Kokoro-82M ONNX weights
    └── voices-v1.0.bin    # Voice embedding vectors
```

---

## Usage

### 1. Direct Python Interface
```python
from faust_plugins.sound import speak, preload, shutdown

# Startup preload (call in FastAPI lifespan or application init)
preload()

# Instant voice synthesis & playback (with random voice blend logged)
speak("Systems operational, Manager.")

# Custom normalization & voice blend
speak(
    "Blue Rose database synchronized.",
    normalization_type="rms",
    blend_voice=True,
    secondary_voice="bf_alice",
    save_path="output.wav"
)

# Explicit lifecycle cleanup
shutdown()
```

### 2. Standalone CLI
```bash
# Basic playback with voice blend logging
python -m faust_plugins.sound.cli "Hello, Manager. Acoustic core online."

# Test RMS broadcast normalization
python -m faust_plugins.sound.cli "Testing RMS normalization." --norm rms

# Pure voice without blending or jitter
python -m faust_plugins.sound.cli "Pure voice test." --no-blend --no-jitter

# List all available Kokoro voice targets
python -m faust_plugins.sound.cli --list-voices
```

### 3. FastAPI Lifecycle Integration
```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from faust_plugins.sound import preload, shutdown
from faust_plugins.sound.api import include_voice_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    preload() # Eliminate cold-start latency
    yield
    shutdown()

app = FastAPI(lifespan=lifespan)
include_voice_router(app)
```
