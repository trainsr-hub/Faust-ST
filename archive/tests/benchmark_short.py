import sys
import time
sys.path.append(r'd:\My Drive\Blue AI\backend\voice')
from speech import speak, speak_by_sentence

# Short text for quick benchmark
TEXT = "Hello Manager. This is a test. The Blue Rose backend is reliable."

def benchmark_speak():
    print("=== Testing speak (adaptive chunked) ===")
    start = time.perf_counter()
    speak(TEXT, block=True)
    elapsed = time.perf_counter() - start
    print(f"Total wall-clock time: {elapsed:.2f}s\n")
    return elapsed

def benchmark_speak_by_sentence():
    print("=== Testing speak_by_sentence (sentence sequential) ===")
    start = time.perf_counter()
    speak_by_sentence(TEXT, block=True)
    elapsed = time.perf_counter() - start
    print(f"Total wall-clock time: {elapsed:.2f}s\n")
    return elapsed

def benchmark_monolithic():
    # Use the CLI or direct kokoro? Let's reuse the synthesize from speech?
    # We'll import the stream synth directly for monolithic.
    from stream_synth import FaustVoiceStream
    import sounddevice as sd
    import numpy as np
    import torch
    import torchaudio
    from kokoro_onnx import Kokoro
    from pathlib import Path

    print("=== Testing monolithic (no chunking) ===")
    model_path = Path(r'd:\My Drive\Blue AI\backend\voice\models\kokoro-v1.0.onnx')
    voices_path = Path(r'd:\My Drive\Blue AI\backend\voice\models\voices-v1.0.bin')
    kokoro = Kokoro(str(model_path), str(voices_path))

    voice = "af_bella"
    speed = 0.84
    language = "en-us"
    pitch_shift = -0.3
    sample_rate = 24000

    start = time.perf_counter()
    samples, _ = kokoro.create(TEXT, voice=voice, speed=speed, lang=language)
    if pitch_shift != 0.0:
        samples_tensor = torch.from_numpy(samples).float().unsqueeze(0)
        pitch_shift_effect = torchaudio.transforms.PitchShift(sample_rate=sample_rate, n_steps=pitch_shift)
        shifted_tensor = pitch_shift_effect(samples_tensor)
        samples = shifted_tensor.squeeze(0).detach().numpy()
    if len(samples) > 0:
        peak = np.max(np.abs(samples))
        if peak > 0:
            samples = samples * (0.9 / peak)
    synth_time = time.perf_counter() - start
    print(f"Synthesis time: {synth_time:.2f}s")

    # Playback
    start_play = time.perf_counter()
    with sd.OutputStream(samplerate=sample_rate, channels=1, dtype='float32') as stream:
        stream.write(samples.astype(np.float32))
        # Wait for playback to finish (approx)
        sd.sleep(int(len(samples) / sample_rate * 1000) + 200)  # extra 200ms
    play_time = time.perf_counter() - start_play
    total = synth_time + play_time
    print(f"Playback time: {play_time:.2f}s")
    print(f"Total wall-clock time: {total:.2f}s\n")
    return total

if __name__ == "__main__":
    print("Benchmarking with text:", TEXT)
    print()
    t1 = benchmark_speak()
    t2 = benchmark_speak_by_sentence()
    t3 = benchmark_monolithic()
    print("=== SUMMARY ===")
    print(f"Adaptive chunked: {t1:.2f}s")
    print(f"Sentence sequential: {t2:.2f}s")
    print(f"Monolithic: {t3:.2f}s")