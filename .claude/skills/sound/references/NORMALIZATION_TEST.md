# Faust Sound Normalization A/B Testing Framework

## Current Peak Normalization (What You Like)
- **Why it sounds breathy/unique**: 
  - Uses peak-based scaling: `samples = samples * (config.peak_norm / peak)`
  - When a sentence starts with a soft consonant or vowel, peak is low → high gain → breathy amplification
  - Hard plosives (p, t, k) create high peaks → strong attenuation → dynamic "breathing" effect
  - This creates natural-sounding dynamic range that mimics human speech variation

## Proposed RMS Normalization (For Comparison)
```python
def apply_rms_normalization(samples: np.ndarray, target_rms: float = 0.15) -> np.ndarray:
    if len(samples) == 0:
        return samples
    # Convert to float for calculation
    float_samples = samples.astype(np.float32) / 32768.0
    # Calculate RMS
    rms = np.sqrt(np.mean(float_samples ** 2))
    if rms > 0:
        gain = target_rms / rms
        # Soft limiting to prevent clipping
        peak = np.max(np.abs(float_samples))
        if peak * gain > 0.95:  # Leave some headroom
            gain = 0.95 / peak
    else:
        gain = 0.0
    # Apply gain and convert back
    normalized = float_samples * gain
    return np.clip(normalized * 32768, -32768, 32767).astype(np.int16)
```

### Expected Differences:
- **RMS**: Consistent perceived loudness across sentences
- **Peak (current)**: Dynamic, expressive "breathing" that varies with phonetic content
- **Your preference**: The breathiness comes from variable gain based on spectral content

## Random Voice Blending with Phenomenal Logging

### Concept:
Each synthesis call randomly varies the voice blend around Faust's core identity (`af_bella`) with a touch of another female voice (`bf_alice` for crispness).

### Implementation:
```python
import random
import logging

logger = logging.getLogger(__name__)

def get_random_voice_blend(base_voice: str = "af_bella", 
                          blend_voice: str = "bf_alice",
                          base_weight_mean: float = 0.85,
                          base_weight_var: float = 0.10,
                          min_base_weight: float = 0.70,
                          max_base_weight: float = 0.95) -> Tuple[str, float]:
    """
    Returns a voice specification for Kokoro with random blending.
    
    For Kokoro ONNX, we actually blend the voice style vectors, not pass a string.
    But for logging/config purposes, we return the effective blend ratio.
    """
    # Random base weight (how much of Faust's core voice)
    base_weight = random.uniform(
        base_weight_mean - base_weight_var,
        base_weight_mean + base_weight_var
    )
    # Clamp to reasonable bounds
    base_weight = max(min_base_weight, min(base_weight, max_base_weight))
    
    blend_weight = 1.0 - base_weight
    
    # Log the phenomenal parameters for later recreation
    logger.info(f"Voice Blend Phenomenal: {base_voice}*{base_weight:.3f} + {blend_voice}*{blend_weight:.3f}")
    
    # For actual Kokoro usage, we'll blend the style vectors
    return base_weight, blend_weight
```

### Usage in Synthesis:
```python
def synthesize(self, text: str, ...):
    # ... existing setup ...
    
    # Get random voice blend for this utterance
    base_weight, blend_weight = get_random_voice_blend(
        base_voice=self.config.voice,
        blend_voice="bf_alice",  # or make this configurable
        base_weight_mean=0.85,
        base_weight_var=0.08
    )
    
    # Get the base and blend voice style vectors from Kokoro
    kokoro = self._get_kokoro()
    base_vector = kokoro.get_voice_style(self.config.voice)
    blend_vector = kokoro.get_voice_style("bf_alice")
    
    # Blend the vectors: O(1) operation
    blended_voice_vector = (base_weight * base_vector) + (blend_weight * blend_vector)
    
    # Use the blended vector for synthesis (this is how Kokoro accepts custom voices!)
    samples, _ = kokoro.create(
        sentence, 
        voice=blended_voice_vector,  # Pass ndarray directly
        speed=chunk_speed,
        lang=language
    )
    
    # ... rest of processing ...
```

### Finding Your Phenomenal Blend:
1. **Enable DEBUG logging** for `faust_plugins.sound` module
2. **Run Faust normally** for a session, letting it speak various phrases
3. **Check logs** for lines like:
   ```
   INFO:faust_plugins.sound.engine:Voice Blend Phenomenal: af_bella*0.823 + bf_alice*0.177
   INFO:faust_plugins.sound.engine:Voice Blend Phenomenal: af_bella*0.912 + bf_alice*0.088
   INFO:faust_plugins.sound.engine:Voice Blend Phenomenal: af_bella*0.765 + bf_alice*0.235
   ```
4. **Identify the standout blend** (e.g., `af_bella*0.88 + bf_alice*0.12` sounded exceptionally natural)
5. **Hard-code that blend** as your new default, or adjust the random parameters to favor that region

### Alternative: Reproducible Phenomenal Seeds
If you want to be able to recreate a phenomenal blend exactly:
```python
def get_phenomenal_voice_blend(seed: Optional[int] = None) -> Tuple[float, float]:
    if seed is not None:
        random.seed(seed)
    base_weight = random.uniform(0.75, 0.90)  # Your discovered sweet spot range
    blend_weight = 1.0 - base_weight
    if seed is not None:
        random.seed()  # Reset seed
    return base_weight, blend_weight
```

Then when you find a great blend in the logs, note the circumstances and potentially use a timestamp-based seed to recreate similar conditions.