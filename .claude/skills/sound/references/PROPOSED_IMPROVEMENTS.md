# Faust Sound Plugin - Proposed Improvements

## 1. Preload / Warmup on Startup
Add an explicit `warmup()` method and call it during application initialization.

### Engine changes (`engine.py`)
```python
class SoundEngine:
    # ... existing code ...

    def warmup(self) -> None:
        """Preload the Kokoro model and allocate resources."""
        # Trigger model loading without synthesizing audio
        _ = self._get_kokoro()
        # Optional: run a dummy synthesis to allocate buffers
        self.synthesize("warmup", block=False)

    def shutdown(self) -> None:
        """Release resources."""
        with self._lock:
            if self._kokoro is not None:
                # Kokoro doesn't have an explicit close, but we can dereference
                self._kokoro = None
                self._model_path = None
                self._voices_path = None
```

### Usage in application startup
```python
# In your main app or Faust C2 initialization
from plugins.sound import get_engine
engine = get_engine()
engine.warmup()  # Preload model for low-latency first use
```

## 2. Per‑Chunk Randomized Parameters for Natural Voice
Modify the synthesis loop to apply random variations to each sentence/chunk.

### Engine changes (`synthesize` method)
```python
import random
from typing import Tuple

def synthesize(
    self,
    text: str,
    voice: Optional[str] = None,
    speed: Optional[float] = None,
    pitch_shift: Optional[float] = None,
    pause_duration: Optional[float] = None,
    language: Optional[str] = None,
    # New args for randomization
    randomize_pitch: bool = False,
    pitch_variation_semitones: float = 0.2,
    randomize_speed: bool = False,
    speed_variation: float = 0.05,
) -> Tuple[np.ndarray, int]:
    # ... existing setup ...

    for i, sentence in enumerate(sentences):
        # Apply per‑chunk randomization
        chunk_speed = speed
        chunk_pitch = pitch_shift
        if randomize_speed:
            chunk_speed *= random.uniform(1 - speed_variation, 1 + speed_variation)
        if randomize_pitch:
            chunk_pitch += random.uniform(-pitch_variation_semitones, pitch_variation_semitones)

        # Synthesize single sentence atomically
        samples, _ = kokoro.create(sentence, voice=voice, speed=chunk_speed, lang=language)

        # Apply pitch shift via torchaudio if requested and available
        if chunk_pitch != 0.0 and torch is not None and torchaudio is not None:
            # ... existing pitch shift code using chunk_pitch ...
```

### CLI / API exposure
Add flags to `cli.py` and `api.py` to control randomization.

## 3. Improved Normalization
Replace peak normalization with loudness normalization (EBU R128) or RMS-based gain.

### Option: RMS normalization (simple, no extra deps)
```python
def _apply_normalization(samples: np.ndarray, target_rms: float = 0.1) -> np.ndarray:
    if len(samples) == 0:
        return samples
    rms = np.sqrt(np.mean(samples.astype(np.float32) ** 2))
    if rms > 0:
        gain = target_rms / rms
        # Prevent clipping
        peak = np.max(np.abs(samples))
        if peak * gain > 1.0:
            gain = 1.0 / peak
    else:
        gain = 0.0
    return (samples * gain).astype(np.int16)
```

Call this after pitch shifting and before int16 conversion.

## 4. WebSocket Broadcasting – Single Background Thread
Replace fire‑and‑forget thread per call with a single producer/consumer queue.

### Engine changes
```python
import queue
from threading import Thread

class SoundEngine:
    def __init__(self, config: Optional[VoiceConfig] = None):
        # ... existing init ...
        self._subtitle_queue: queue.Queue[Optional[str]] = queue.Queue()
        self._subtitle_thread = Thread(target=self._subtitle_worker, daemon=True)
        self._subtitle_thread.start()

    def _subtitle_worker(self) -> None:
        while True:
            text = self._subtitle_queue.get()
            if text is None:  # Sentinel to shutdown
                break
            self._send_subtitle_async(text)

    def _broadcast_subtitle(self, text: str) -> None:
        self._subtitle_queue.put(text)

    def shutdown(self) -> None:
        # ... existing cleanup ...
        self._subtitle_queue.put(None)
        self._subtitle_thread.join(timeout=1.0)
```

## 5. Cleanup / Resource Release
Added `shutdown()` method above; call it on application exit.

## 6. Batch Processing Definition
A **batch** in this context means synthesizing multiple independent texts in one call (e.g., for preprocessing a list of cues). Implement a `batch_synthesize` method:

```python
def batch_synthesize(
    self,
    texts: List[str],
    **kwargs
) -> List[Tuple[np.ndarray, int]]:
    return [self.synthesize(t, **kwargs) for t in texts]
```

## 7. Voice Blending (Optional)
To blend two voices, synthesize each voice separately and mix the audio streams with a weight.

```python
def synthesize_blended(
    self,
    text: str,
    voice_a: str,
    voice_b: str,
    weight: float = 0.5,  # 0.0 -> all A, 1.0 -> all B
    **kwargs
) -> Tuple[np.ndarray, int]:
    samples_a, sr = self.synthesize(text, voice=voice_a, **kwargs)
    samples_b, _ = self.synthesize(text, voice=voice_b, **kwargs)
    # Ensure same length (should be identical for same text)
    mixed = (samples_a.astype(np.float32) * (1 - weight) +
             samples_b.astype(np.float32) * weight)
    # Renormalize to int16
    mixed_int16 = np.clip(mixed, -32768, 32767).astype(np.int16)
    return mixed_int16, sr
```

## 8. Removing Silent Bypasses
Replace silent `except:` blocks with logging warnings.

Example in pitch‑shift block:
```python
import logging
logger = logging.getLogger(__name__)

# Inside synthesize loop
if pitch_shift != 0.0 and torch is not None and torchaudio is not None:
    try:
        # ... pitch shift ...
    except Exception as e:
        logger.warning(f"Pitch shift failed: {e}; using unshifted audio")
```

## Summary of Changes
| Area | Change | Benefit |
|------|--------|---------|
| Startup | `warmup()` / eager model load | Eliminates first‑use latency |
| Naturalness | Per‑chunk random pitch/speed | More human‑like voice |
| Normalization | RMS/loudness normalization | Consistent perceived volume |
| WebSocket | Single background thread | Reduced thread overhead, deterministic cleanup |
| Cleanup | `shutdown()` method | Proper resource release |
| Error Handling | Logging instead of silent pass | Visible feedback when fallbacks occur |
| Batch | `batch_synthesize` | Efficient processing of multiple cues |
| Voice Blending | Optional mixing function | Expressive voice variations |

These modifications maintain the existing clean structure while addressing latency, quality, and responsiveness concerns raised in the vision.