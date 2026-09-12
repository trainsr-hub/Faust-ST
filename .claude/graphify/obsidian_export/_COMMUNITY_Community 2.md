---
type: community
cohesion: 0.08
members: 46
---

# Community 2

**Cohesion:** 0.08 - loosely connected
**Members:** 46 nodes

## Members
- [[dot-_append_spoken_transcript()]] - code - .claude/skills/sound/scripts/engine.py
- [[dot-_apply_fast_pitch_shift()]] - code - .claude/skills/sound/scripts/engine.py
- [[dot-_apply_normalization()]] - code - .claude/skills/sound/scripts/engine.py
- [[dot-_generate_voice_style()]] - code - .claude/skills/sound/scripts/engine.py
- [[dot-_get_kokoro()]] - code - .claude/skills/sound/scripts/engine.py
- [[dot-_resolve_model_paths()]] - code - .claude/skills/sound/scripts/engine.py
- [[dot-list_female_voices()]] - code - .claude/skills/sound/scripts/engine.py
- [[dot-list_voices()]] - code - .claude/skills/sound/scripts/engine.py
- [[dot-preload()]] - code - .claude/skills/sound/scripts/engine.py
- [[dot-save_wav()]] - code - .claude/skills/sound/scripts/engine.py
- [[dot-shutdown()]] - code - .claude/skills/sound/scripts/engine.py
- [[dot-speak()]] - code - .claude/skills/sound/scripts/engine.py
- [[dot-synthesize()]] - code - .claude/skills/sound/scripts/engine.py
- [[dot-synthesize_stream()]] - code - .claude/skills/sound/scripts/engine.py
- [[Append spoken text to daily transcript log in…]] - rationale - .claude/skills/sound/scripts/engine.py
- [[Applies audio normalization. - 'peak' Dynamic range, breathy amplification on…]] - rationale - .claude/skills/sound/scripts/engine.py
- [[Attempt to parse a base string into Vietnamese (initial + rime).]] - rationale - .claude/skills/sound/scripts/vietnamese_g2p.py
- [[Calculates a blended neural voice style vector in O(1) time. When…]] - rationale - .claude/skills/sound/scripts/engine.py
- [[Convert a single word into Kokoro IPA if it matches Vietnamese phonology or…]] - rationale - .claude/skills/sound/scripts/vietnamese_g2p.py
- [[Decompose Vietnamese tone diacritics into base characters and tone ID (1-6).]] - rationale - .claude/skills/sound/scripts/vietnamese_g2p.py
- [[Detect if string contains Vietnamese diacritics or characteristic vowels.]] - rationale - .claude/skills/sound/scripts/vietnamese_g2p.py
- [[Faust Vietnamese Grapheme-to-Phoneme (G2P) Converter for Kokoro-82M ONNX.…]] - rationale - .claude/skills/sound/scripts/vietnamese_g2p.py
- [[Kokoro]] - code
- [[Lazy-load Kokoro ONNX instance thread-safely.]] - rationale - .claude/skills/sound/scripts/engine.py
- [[Parse a mixed VietnameseEnglish text string and convert Vietnamese segments to…]] - rationale - .claude/skills/sound/scripts/vietnamese_g2p.py
- [[Path_3]] - code
- [[Preload neural weights into memory and perform micro-warmup. Call during…]] - rationale - .claude/skills/sound/scripts/engine.py
- [[Release audio devices, stop background workers, and clean up resources.]] - rationale - .claude/skills/sound/scripts/engine.py
- [[Resolve paths to Kokoro ONNX model and voice binaries.]] - rationale - .claude/skills/sound/scripts/engine.py
- [[Return all available voice presets in the voices binary.]] - rationale - .claude/skills/sound/scripts/engine.py
- [[Return cached list of female voice presets available for blending.]] - rationale - .claude/skills/sound/scripts/engine.py
- [[Save PCM samples to a standard WAV audio file.]] - rationale - .claude/skills/sound/scripts/engine.py
- [[Self-contained neural TTS engine for Faust. Implements sentence-sequential…]] - rationale - .claude/skills/sound/scripts/engine.py
- [[SoundEngine]] - code - .claude/skills/sound/scripts/engine.py
- [[Synthesize text into a 16-bit PCM numpy array using sentence-sequential…]] - rationale - .claude/skills/sound/scripts/engine.py
- [[Synthesizes speech and plays it immediately. Uses pipelined streaming by…]] - rationale - .claude/skills/sound/scripts/engine.py
- [[Ultra-fast Fourier sinc pitch shift. Shifts pitch by pitch_steps semitones in…]] - rationale - .claude/skills/sound/scripts/engine.py
- [[Yields synthesized audio chunks sentence-by-sentence as they are generated.…]] - rationale - .claude/skills/sound/scripts/engine.py
- [[_async_speak()]] - code - .claude/skills/sound/scripts/engine.py
- [[contains_vietnamese()]] - code - .claude/skills/sound/scripts/vietnamese_g2p.py
- [[extract_tone_and_base()]] - code - .claude/skills/sound/scripts/vietnamese_g2p.py
- [[ndarray_1]] - code
- [[parse_vietnamese_syllable()]] - code - .claude/skills/sound/scripts/vietnamese_g2p.py
- [[vi_text_to_ipa()]] - code - .claude/skills/sound/scripts/vietnamese_g2p.py
- [[vi_word_to_ipa()]] - code - .claude/skills/sound/scripts/vietnamese_g2p.py
- [[vietnamese_g2p.py]] - code - .claude/skills/sound/scripts/vietnamese_g2p.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Community_2
SORT file.name ASC
```

## Connections to other communities
- 11 edges to [[_COMMUNITY_Community 0]]
- 2 edges to [[_COMMUNITY_Community 5]]
- 2 edges to [[_COMMUNITY_Community 6]]
- 1 edge to [[_COMMUNITY_Community 10]]
- 1 edge to [[_COMMUNITY_Community 13]]

## Top bridge nodes
- [[SoundEngine]] - degree 27, connects to 5 communities
- [[dot-speak()]] - degree 9, connects to 1 community
- [[vietnamese_g2p.py]] - degree 7, connects to 1 community
- [[vi_text_to_ipa()]] - degree 7, connects to 1 community
- [[dot-_append_spoken_transcript()]] - degree 5, connects to 1 community