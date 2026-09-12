# Vietnamese TTS (Faust G2P Acoustic Core)

Specialized acoustic synthesis skill enabling Faust to speak natural Vietnamese while retaining her signature neural voice profile (`af_bella` + $O(1)$ style vector blending, Fourier pitch shift, and breathy dynamic range).

## Overview

Kokoro-82M ONNX natively lacks Vietnamese phoneme dictionaries. This skill employs a lightweight, deterministic **Vietnamese Grapheme-to-Phoneme (G2P) Mapper** (`.claude/skills/sound/scripts/vietnamese_g2p.py`) that decomposes Vietnamese orthography into International Phonetic Alphabet (IPA) tokens with tone contours:

- **6-Tone Contour Mapping**:
  - *Ngang* (Level 1) $\rightarrow$ Level pitch / unmodified
  - *Huyền* (Falling 2) $\rightarrow$ Falling pitch `↓`
  - *Sắc* (Rising 3) $\rightarrow$ Rising pitch `↗`
  - *Hỏi* (Dipping-rising 4) $\rightarrow$ Dipping-rising pitch `↘↗`
  - *Ngã* (Creaky-rising 5) $\rightarrow$ Glottalized rising pitch `ʔ↗`
  - *Nặng* (Constricted drop 6) $\rightarrow$ Abrupt drop `↓`
- **Onset & Rime Decomposition**: Maps initial consonants (`ngh`, `th`, `tr`, `ph`, `gi`, `qu`, etc.), nucleus diphthongs (`iê`, `ươ`, `uô`), and glides/triphthongs to Kokoro-recognized IPA symbols.
- **Zero Model Reload / CPU-First**: Passes raw IPA tokens directly into Kokoro via `is_phonemes=True`, preserving 0ms cold-start and $O(1)$ voice blending.

## Usage

### 1. Direct Synthesis via CLI
```bash
python .claude/skills/sound/scripts/cli.py "Xin chào Manager. Tôi là Faust, sẵn sàng phục vụ ngài."
```

### 2. Programmatic Invocation (Python)
```python
from sound import speak

# Auto-detects Vietnamese and applies G2P mapping automatically
speak("Hệ thống âm thanh tiếng Việt đang hoạt động bình thường, Manager.")
```

### 3. Standalone G2P Conversion Inspection
```bash
python -c "from sound.scripts.vietnamese_g2p import vi_text_to_ipa; print(vi_text_to_ipa('Chào Manager, tôi là Faust.'))"
```

## Architecture & Integration

1. **G2P Engine**: Located in `.claude/skills/sound/scripts/vietnamese_g2p.py`.
2. **Audio Pipeline**: Seamlessly integrated into `SoundEngine.synthesize()` and `SoundEngine.synthesize_stream()` in `.claude/skills/sound/scripts/engine.py`.
3. **Special Loanwords**: Custom dictionary for English technical terms mixed into Vietnamese sentences (`faust`, `manager`, `c2`, `tts`, `api`, `ui`, `claude`).

## Future Expansion & Fine-Tuning
- **Dialectal Variation**: Adjust initial consonants and codas for Southern vs. Northern dialect profiles.
- **Micro-Pitch Curves**: Fine-tune pitch contours for more pronounced tonal inflection on long vowels.
