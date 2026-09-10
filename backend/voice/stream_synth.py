#!/usr/bin/env python3
"""
Faust Voice Streaming Synthesizer for low-latency, chunked TTS.
"""
import numpy as np
import sounddevice as sd
import torch
import torchaudio
from kokoro_onnx import Kokoro
from pathlib import Path
import queue
import threading
import time

class FaustVoiceStream:
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

        # Audio queue and playback thread
        self.audio_queue = queue.Queue()
        self.stream = None
        self.running = False
        self.play_thread = None

        # For overlap-add to avoid clicks between chunks
        self.overlap_samples = np.array([], dtype=np.float32)
        self.overlap_size = int(0.01 * self.sample_rate)  # 10ms overlap

    def _synthesize_chunk(self, text_chunk):
        """Synthesize a text chunk and return float32 audio in [-1, 1]"""
        if not text_chunk.strip():
            return np.array([], dtype=np.float32)

        samples, _ = self.kokoro.create(
            text_chunk,
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

    def _audio_playback_loop(self):
        """Continuously play audio from queue with overlap-add"""
        with sd.OutputStream(
            samplerate=self.sample_rate,
            channels=1,
            dtype='float32',
            blocksize=0  # Let sounddevice choose optimal blocksize
        ) as stream:
            self.stream = stream
            while self.running or not self.audio_queue.empty():
                try:
                    # Get chunk with timeout to check self.running
                    chunk = self.audio_queue.get(timeout=0.1)

                    # Apply overlap-add if we have leftover from previous chunk
                    if len(self.overlap_samples) > 0 and len(chunk) > 0:
                        # Crossfade: end of overlap + start of chunk
                        fade_out = np.linspace(1, 0, len(self.overlap_samples), dtype=np.float32)
                        fade_in = np.linspace(0, 1, len(self.overlap_samples), dtype=np.float32)
                        crossfade_len = min(len(self.overlap_samples), len(chunk))
                        if crossfade_len > 0:
                            overlap_part = (
                                self.overlap_samples[-crossfade_len:] * fade_out[-crossfade_len:] +
                                chunk[:crossfade_len] * fade_in[:crossfade_len]
                            )
                            chunk = np.concatenate([
                                overlap_part,
                                chunk[crossfade_len:]
                            ])

                    # Play chunk
                    stream.write(chunk)

                    # Save end of chunk for next overlap
                    if len(chunk) > self.overlap_size:
                        self.overlap_samples = chunk[-self.overlap_size:].copy()
                    else:
                        self.overlap_samples = chunk.copy()

                except queue.Empty:
                    continue
                except Exception as e:
                    print(f"Audio playback error: {e}")
                    break

    def start(self):
        """Start the audio playback thread"""
        if self.running:
            return
        self.running = True
        self.play_thread = threading.Thread(target=self._audio_playback_loop, daemon=True)
        self.play_thread.start()

    def stop(self):
        """Stop playback and cleanup"""
        self.running = False
        if self.play_thread:
            self.play_thread.join(timeout=2.0)
        self.audio_queue = queue.Queue()  # Clear queue
        self.overlap_samples = np.array([], dtype=np.float32)

    def reset_overlap(self):
        """Clear the overlap buffer to avoid cross-chunk stitching artifacts."""
        self.overlap_samples = np.array([], dtype=np.float32)

    def feed_text(self, text_chunk):
        """Feed a text chunk for synthesis and queuing"""
        if not self.running:
            self.start()
        audio_chunk = self._synthesize_chunk(text_chunk)
        if len(audio_chunk) > 0:
            self.audio_queue.put(audio_chunk)

    def flush(self):
        """Wait for queue to empty and currently playing audio to finish"""
        while not self.audio_queue.empty() and self.running:
            time.sleep(0.01)
        # Give a small margin for the hardware output buffer to drain
        if self.running:
            time.sleep(0.15)