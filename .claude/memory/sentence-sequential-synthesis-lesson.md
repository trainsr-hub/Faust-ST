---
name: sentence-sequential-synthesis-lesson
description: Lesson on achieving natural Faust voice via sentence-sequential synthesis with sample-accurate silence pauses
metadata: 
  node_type: memory
  type: reference
  originSessionId: fa9813ad-994d-4eb0-9fef-abe73506f3dc
  modified: 2026-09-06T04:50:28.873Z
---

**Lesson Learned**: The pristine, nonchalant Faust voice heard in the web parameter tester results from sentence-sequential synthesis (full sentences synthesized atomically) combined with mathematically exact digital silence intervals between sentences, not from timing-based sleeping or live audio buffering.

**Why it works**:
- Each sentence is synthesized independently via Kokoro-82M ONNX, preserving complete prosody and natural sentence-final contour.
- Silence between sentences is generated as precise zero-sample buffers (`np.zeros(pause_duration * sample_rate)`) and concatenated into a single PCM stream.
- This eliminates overlap glitches caused by thread scheduling or soundcard buffer drain timing in live streaming approaches.

**Contrast with prior attempts**:
- Live terminal synthesis used `time.sleep()` between `FaustVoiceStream.flush()` calls, causing drift and overlap when the audio hardware buffer hadn't fully drained.
- Micro-chunking (word/sub-word level) disrupted prosody, sounding robotic despite low latency.

**How to apply in Faust systems**:
1. For any voice output (terminal, Web-OS, plugins), generate audio as complete sentences with embedded digital silence.
2. Avoid relying on OS-level timing for inter-sentence gaps; instead, bake silence into the audio buffer.
3. Maintain sentence-sequential chunking as the atomic unit for synthesis to preserve natural cadence.
4. Apply Faust Acoustic Core parameter ranges: speed 0.80–0.90x, pitch shift -0.2 to -0.5, with light randomization (±0.02 speed, ±0.1 semitones) for varied expressiveness.

**Verification**: The effect was validated via listening tests and benchmark timings (~0.4s/word synthesis) on Sep 6, 2026.

Related memories: [[faust-acoustic-engine]], [[faust-voice-cors-fix]], [[project-architecture]]