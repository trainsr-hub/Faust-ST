#!/usr/bin/env python3
"""
Generate an HTML audio test comparing different Faust voice synthesis methods on Petunia sentences.
"""

import sys
import os
import re
import io
import base64
import wave
import numpy as np
import torch
import torchaudio
from kokoro_onnx import Kokoro
from pathlib import Path

# Add the backend/voice directory to path to import our modules
sys.path.append(str(Path(__file__).parent / "backend" / "voice"))

from speech import _chunk_text_adaptive

# --- Synthesizer Class (same as in test_chunking_comparison.py) ---
class Synthesizer:
    def __init__(self, voice="af_bella", speed=0.84, language="en-us", pitch_shift=-0.3):
        self.voice = voice
        self.speed = speed
        self.language = language
        self.pitch_shift = pitch_shift
        self.sample_rate = 24000  # Kokoro default

        # Initialize Kokoro ONNX
        model_path = Path(__file__).parent / "backend" / "voice" / "models" / "kokoro-v1.0.onnx"
        voices_path = Path(__file__).parent / "backend" / "voice" / "models" / "voices-v1.0.bin"
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

# --- Audio to WAV Base64 Conversion ---
def audio_to_wav_base64(audio, sample_rate):
    """Convert float32 audio array to WAV bytes and then to base64 string."""
    if len(audio) == 0:
        return ""
    # Clip and convert to 16-bit PCM
    audio_int16 = (np.clip(audio, -1.0, 1.0) * 32767).astype(np.int16)
    buffer = io.BytesIO()
    with wave.open(buffer, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(audio_int16.tobytes())
    wav_bytes = buffer.getvalue()
    b64 = base64.b64encode(wav_bytes).decode('utf-8')
    return b64

# --- Synthesis Methods ---
def synthesize_adaptive_chunked(text, synth):
    chunks = _chunk_text_adaptive(text, first_chunk_max_words=5, subsequent_chunk_max_words=10)
    audio_parts = [synth.synthesize_text(chunk) for chunk in chunks]
    return np.concatenate(audio_parts) if audio_parts else np.array([])

def synthesize_sentence_sequential(text, synth):
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [s.strip() for s in sentences if s.strip()]
    audio_parts = [synth.synthesize_text(sentence) for sentence in sentences]
    return np.concatenate(audio_parts) if audio_parts else np.array([])

def synthesize_monolithic(text, synth):
    return synth.synthesize_text(text)

# --- Test Sentences about Petunia ---
TEST_SENTENCES = [
    "Petunia is a beautiful flowering plant known for its vibrant colors and trumpet-shaped blooms.",
    "Petunia plants are popular in gardens and hanging baskets due to their long blooming period and ease of care.",
    "Petunia comes in many varieties including grandiflora, multiflora, milliflora, and trailing types, each with unique characteristics."
]

METHODS = [
    ("adaptive-chunked", synthesize_adaptive_chunked),
    ("sentence-sequential", synthesize_sentence_sequential),
    ("monolithic", synthesize_monolithic)
]

def generate_html():
    synth = Synthesizer()
    sample_rate = synth.sample_rate

    html_parts = []
    html_parts.append('<!DOCTYPE html>')
    html_parts.append('<html lang="en">')
    html_parts.append('<head>')
    html_parts.append('    <meta charset="UTF-8">')
    html_parts.append('    <meta name="viewport" content="width=device-width, initial-scale=1.0">')
    html_parts.append('    <title>Faust Voice Test: Petunia</title>')
    html_parts.append('    <style>')
    html_parts.append('        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }')
    html_parts.append('        h1 { color: #2c3e50; text-align: center; }')
    html_parts.append('        table { width: 100%; border-collapse: collapse; margin-top: 20px; }')
    html_parts.append('        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }')
    html_parts.append('        th { background-color: #f2f2f2; }')
    html_parts.append('        tr:nth-child(even) { background-color: #f9f9f9; }')
    html_parts.append('        audio { width: 100%; margin-top: 8px; }')
    html_parts.append('        .sentence { font-weight: bold; color: #34495e; }')
    html_parts.append('        .method { font-size: 0.9em; color: #7f8c8d; }')
    html_parts.append('    </style>')
    html_parts.append('</head>')
    html_parts.append('<body>')
    html_parts.append('    <h1>Faust Voice Test: Petunia</h1>')
    html_parts.append('    <p>Comparing three synthesis methods: adaptive-chunked, sentence-sequential, and monolithic.</p>')
    html_parts.append('    <table>')
    html_parts.append('        <thead>')
    html_parts.append('            <tr>')
    html_parts.append('                <th>Test Sentence</th>')
    for method_name, _ in METHODS:
        html_parts.append(f'                <th>{method_name}</th>')
    html_parts.append('            </tr>')
    html_parts.append('        </thead>')
    html_parts.append('        <tbody>')

    for i, sentence in enumerate(TEST_SENTENCES, start=1):
        html_parts.append('            <tr>')
        html_parts.append(f'                <td class="sentence">{i}. {sentence}</td>')
        for method_name, method_func in METHODS:
            # Synthesize audio for this sentence and method
            audio = method_func(sentence, synth)
            b64_audio = audio_to_wav_base64(audio, sample_rate)
            html_parts.append('                <td>')
            if b64_audio:
                html_parts.append(f'                    <audio controls src="data:audio/wav;base64,{b64_audio}">Your browser does not support the audio element.</audio>')
            else:
                html_parts.append('                    <em>No audio generated</em>')
            html_parts.append('                </td>')
        html_parts.append('            </tr>')

    html_parts.append('        </tbody>')
    html_parts.append('    </table>')
    html_parts.append('    <p><em>Generated by Faust Acoustic Core. Click the play buttons to listen to each variation.</em></p>')
    html_parts.append('</body>')
    html_parts.append('</html>')

    return '\n'.join(html_parts)

if __name__ == "__main__":
    html_content = generate_html()
    output_file = "petunia_voice_test.html"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"HTML test page written to: {output_file}")
    print("Open this file in a web browser to listen to the audio comparisons.")