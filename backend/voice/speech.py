#!/usr/bin/env python3
"""
Faust Speech Interface - high-level API for chunked voice output.
"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from stream_synth import FaustVoiceStream
import re
import time

# Global voice stream instance
_voice_stream = None

# Synthesizer class for API use
class Synthesizer:
    def __init__(self, voice="af_bella", speed=0.84, language="en-us", pitch_shift=-0.3):
        self.voice = voice
        self.speed = speed
        self.language = language
        self.pitch_shift = pitch_shift
        self.sample_rate = 24000  # Kokoro default

        # Initialize Kokoro ONNX
        model_path = Path(__file__).parent / "models" / "kokoro-v1.0.onnx"
        voices_path = Path(__file__).parent / "models" / "voices-v1.0.bin"
        self.kokoro = Kokoro(str(model_path), str(voices_path))

    def synthesize_text(self, text):
        """Synthesizes text to float32 numpy array in [-1, 1]"""
        if not text.strip():
            return np.array([], dtype=np.float32)

        samples, _ = self.kokoro.create(
            text.strip(),
            voice=self.voice,
            speed=self.speed,
            lang=self.language
        )

        # Apply pitch shift
        if self.pitch_shift != 0.0:
            samples_tensor = torch.from_numpy(samples).float().unsqueeze(0)
            pitch_shift_effect = torchaudio.transforms.PitchShift(
                sample_rate=self.sample_rate,
                n_steps=self.pitch_shift
            )
            shifted_tensor = pitch_shift_effect(samples_tensor)
            samples = shifted_tensor.squeeze(0).detach().numpy()

        # Normalize
        if len(samples) > 0:
            peak = np.max(np.abs(samples))
            if peak > 0:
                samples = samples * (0.9 / peak)

        return samples.astype(np.float32)

class SilentVoiceStream(FaustVoiceStream):
    """Voice stream that does not auto-start playback thread on feed_text."""
    def feed_text(self, text_chunk):
        """Synthesize and queue audio without starting playback thread."""
        audio_chunk = self._synthesize_chunk(text_chunk)
        if len(audio_chunk) > 0:
            self.audio_queue.put(audio_chunk)

def _get_voice_stream():
    global _voice_stream
    if _voice_stream is None:
        _voice_stream = FaustVoiceStream(
            voice="af_bella",
            speed=0.84,
            language="en-us",
            pitch_shift=-0.3
        )
        _voice_stream.start()
    return _voice_stream

def _chunk_text_adaptive(text, first_chunk_max_words=5, subsequent_chunk_max_words=10):
    """
    Split text into chunks for adaptive streaming:
    - First chunk small (first_chunk_max_words words) for low time-to-first-audio.
    - Subsequent chunks larger (subsequent_chunk_max_words words) for better prosody.
    """
    if not text or not text.strip():
        return []

    words = text.split()
    if not words:
        return []

    chunks = []

    # First chunk: small for low latency
    first_end = min(first_chunk_max_words, len(words))
    first_chunk = ' '.join(words[0:first_end])
    chunks.append(first_chunk)

    # Subsequent chunks: larger for better prosody
    i = first_end
    while i < len(words):
        end = min(i + subsequent_chunk_max_words, len(words))
        chunk = ' '.join(words[i:end])
        chunks.append(chunk)
        i = end

    # Ensure each chunk ends with a space for natural break (except possibly the last)
    chunks = [chunk + ' ' for chunk in chunks]

    return chunks


def speak_by_sentence(text, block=True):
    """
    Speak text by synthesizing each sentence as a single chunk (non-chunked) to preserve
    prosodic naturalness. Creates a new voice stream per sentence to ensure clean separation
    and avoid overlap between sentences. Adds slight parameter randomization for natural
    variability and configurable pauses between sentences.

    Args:
        text (str): The full text to speak.
        block (bool): If True, wait for each sentence to finish before proceeding to the next.
    """
    if not text or not text.strip():
        return

    MODE = "Sentence-Pipelined"
    # Split into sentences, keeping the delimiter with the preceding part
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    # Filter out any empty strings
    sentences = [s.strip() for s in sentences if s.strip()]

    print(f"[{MODE}] Speaking {len(sentences)} sentence(s)...")

    for i, sentence in enumerate(sentences):
        # Add slight randomization to voice parameters for natural variability
        import random
        base_speed = 0.84
        base_pitch = -0.3
        # Randomize speed ±0.02 and pitch ±0.1 semitones
        randomized_speed = base_speed + random.uniform(-0.02, 0.02)
        randomized_pitch = base_pitch + random.uniform(-0.1, 0.1)

        # Create a fresh voice stream for each sentence with randomized parameters
        vs = FaustVoiceStream(
            voice="af_bella",
            speed=randomized_speed,
            language="en-us",
            pitch_shift=randomized_pitch
        )
        vs.start()
        try:
            # Reset overlap buffer to avoid stitching artifacts (though not needed for single chunk)
            vs.reset_overlap()
            # Feed the entire sentence as a single chunk
            start_synth = time.perf_counter()
            vs.feed_text(sentence + ' ')  # trailing space helps with natural break
            end_synth = time.perf_counter()
            synth_duration = end_synth - start_synth
            sentence_preview = sentence[:60] + ('...' if len(sentence) > 60 else '')
            print(f"[{MODE}] Synthesis started: Sentence {i+1}/{len(sentences)}: {sentence_preview}")
            print(f"[{MODE}] Synthesis done in {synth_duration:.2f}s. Audio queued for playback.")
            if block:
                print(f"[{MODE}] Playing sentence {i+1}...")
                vs.flush()  # wait for this sentence to finish playing
                print(f"[{MODE}] Finished sentence {i+1}. (total block time: {time.perf_counter() - start_synth:.2f}s)")
        finally:
            vs.stop()

        # Add pause between sentences (except after the last sentence)
        if i < len(sentences) - 1 and block:
            # Base pause of 0.3s plus randomization up to 0.2s for natural feel
            base_pause = 0.3
            random_pause = random.uniform(0, 0.2)
            pause_duration = base_pause + random_pause
            print(f"[{MODE}] Pausing for {pause_duration:.2f}s between sentences...")
            time.sleep(pause_duration)

    print(f"[{MODE}] All sentences spoken.")


def speak(text, block=True):
    """
    Speak the given text using adaptive chunked streaming:
    - First chunk small (3-5 words) for low time-to-first-audio.
    - Subsequent chunks larger (8-10 words) for better prosody.
    Uses overlap-add crossfading in FaustVoiceStream to stitch chunks.

    Args:
        text (str): The text to speak.
        block (bool): If True, wait for speech to finish before returning.
    """
    if not text or not text.strip():
        return

    MODE = "Adaptive-Chunked"
    chunks = _chunk_text_adaptive(text, first_chunk_max_words=5, subsequent_chunk_max_words=10)
    print(f"[{MODE}] Speaking with {len(chunks)} chunk(s)...")

    # Create a fresh voice stream for each invocation to avoid state conflicts
    vs = FaustVoiceStream(
        voice="af_bella",
        speed=0.84,
        language="en-us",
        pitch_shift=-0.3
    )
    vs.start()
    try:
        total_start = time.perf_counter()
        for i, chunk in enumerate(chunks):
            chunk_preview = chunk[:50] + ('...' if len(chunk) > 50 else '')
            start_synth = time.perf_counter()
            vs.feed_text(chunk)
            end_synth = time.perf_counter()
            synth_duration = end_synth - start_synth
            print(f"[{MODE}] Chunk {i+1}/{len(chunks)}: {chunk_preview}")
            print(f"[{MODE}] Synthesis done in {synth_duration:.2f}s. Audio queued for playback.")
            if block and i == len(chunks) - 1:  # Only flush on last chunk if blocking
                print(f"[{MODE}] Playing final chunk and draining audio buffer...")
                vs.flush()
                print(f"[{MODE}] Finished. (total time: {time.perf_counter() - total_start:.2f}s)")
        if not block:
            print(f"[{MODE}] Non-blocking mode: audio will play in background.")
    finally:
        vs.stop()
        if block:
            print(f"[{MODE}] All chunks spoken.")

def speak_deferred(text, block=True, max_wait=1.0):
    """
    Synthesize text in parallel with reasoning, but defer playback until
    a sentence boundary is detected or max_wait elapses.

    Args:
        text (str): The full text to speak (assumed already available).
        block (bool): If True, wait for playback to finish before returning.
        max_wait (float): Maximum seconds to wait for a sentence boundary
            before forcing playback.
    """
    if not text or not text.strip():
        return

    # Use same chunking logic as speak
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    chunks = []
    for sent in sentences:
        sent = sent.strip()
        if not sent:
            continue
        if len(sent.split()) <= 5:
            chunks.append(sent)
        else:
            parts = re.split(r'(?<=[,;:])\s+', sent)
            for part in parts:
                part = part.strip()
                if part:
                    words = part.split()
                    if len(words) > 4:
                        for i in range(0, len(words), 3):
                            chunk = ' '.join(words[i:i+3])
                            chunks.append(chunk)
                    else:
                        chunks.append(part)
    chunks = [chunk + ' ' for chunk in chunks]

    vs = SilentVoiceStream(
        voice="af_bella",
        speed=0.84,
        language="en-us",
        pitch_shift=-0.3
    )
    # Feed all chunks (synthesis happens, audio queued)
    for chunk in chunks:
        vs.feed_text(chunk)

    # Start playback thread and play queued audio
    vs.start()
    if block:
        vs.flush()
    vs.stop()

def speak_async(text):
    """Speak text without blocking."""
    speak(text, block=False)

def stop():
    """Stop the voice stream."""
    global _voice_stream
    if _voice_stream is not None:
        _voice_stream.stop()
        _voice_stream = None

# For testing
if __name__ == "__main__":
    text = "The Blue Rose backend is the single source of truth for persistent resources using a five-tier SQLite architecture. It handles projects like Universe 25 and music app managing static data, event logs, and inventory with ETL flows. Faust relies on it for state persistence across sessions."
    print("Testing speak_deferred (deferred playback with parallel synthesis)...")
    speak_deferred(text, block=True)
    print("Deferred playback test complete.")