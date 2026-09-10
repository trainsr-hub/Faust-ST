#!/usr/bin/env python3
"""
Generate an HTML audio test for Faust voice synthesis on arbitrary text.
Uses sentence-sequential synthesis to preserve prosody.
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

# --- Synthesizer Class (same as in generate_petunia_test.py) ---
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
def synthesize_sentence_sequential(text, synth):
    """Synthesize text by splitting into sentences and concatenating audio."""
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [s.strip() for s in sentences if s.strip()]
    audio_parts = [synth.synthesize_text(sentence) for sentence in sentences]
    return np.concatenate(audio_parts) if audio_parts else np.array([])

def generate_html(text):
    synth = Synthesizer()
    sample_rate = synth.sample_rate

    # Synthesize the audio
    audio = synthesize_sentence_sequential(text, synth)
    b64_audio = audio_to_wav_base64(audio, sample_rate)

    html_parts = []
    html_parts.append('<!DOCTYPE html>')
    html_parts.append('<html lang="en">')
    html_parts.append('<head>')
    html_parts.append('    <meta charset="UTF-8">')
    html_parts.append('    <meta name="viewport" content="width=device-width, initial-scale=1.0">')
    html_parts.append('    <title>Faust Voice Test</title>')
    html_parts.append('    <style>')
    html_parts.append('        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }')
    html_parts.append('        h1 { color: #2c3e50; text-align: center; }')
    html_parts.append('        .container { max-width: 600px; margin: 0 auto; }')
    html_parts.append('        .text-box { background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 15px; margin: 20px 0; }')
    html_parts.append('        .controls { text-align: center; margin: 20px 0; }')
    html_parts.append('        button { background-color: #007bff; color: white; border: none; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 4px; }')
    html_parts.append('        button:hover { background-color: #0056b3; }')
    html_parts.append('        audio { width: 100%; margin-top: 10px; }')
    html_parts.append('        .info { color: #6c757d; font-size: 0.9em; }')
    html_parts.append('    </style>')
    html_parts.append('</head>')
    html_parts.append('<body>')
    html_parts.append('    <div class="container">')
    html_parts.append('        <h1>Faust Voice Test</h1>')
    html_parts.append('        <p>Testing sentence-sequential synthesis for natural prosody.</p>')
    html_parts.append('        <div class="text-box">')
    html_parts.append(f'            <strong>Text:</strong><br>{text}')
    html_parts.append('        </div>')
    html_parts.append('        <div class="controls">')
    html_parts.append('            <button onclick="playAudio()">Play Voice</button>')
    html_parts.append('        </div>')
    if b64_audio:
        html_parts.append('        <audio id="player" controls>')
        html_parts.append(f'            <source src="data:audio/wav;base64,{b64_audio}" type="audio/wav">')
        html_parts.append('            Your browser does not support the audio element.')
        html_parts.append('        </audio>')
    else:
        html_parts.append('        <p><em>No audio generated</em></p>')
    html_parts.append('        <p class="info">Generated by Faust Acoustic Core. Uses sentence-sequential synthesis to preserve natural prosody.</p>')
    html_parts.append('    </div>')
    html_parts.append('    <script>')
    html_parts.append('        function playAudio() {')
    html_parts.append('            var audio = document.getElementById("player");')
    html_parts.append('            audio.play();')
    html_parts.append('        }')
    html_parts.append('    </script>')
    html_parts.append('</body>')
    html_parts.append('</html>')

    return '\n'.join(html_parts)

def main():
    if len(sys.argv) > 1:
        text = ' '.join(sys.argv[1:])
    else:
        text = "Hello Manager. This is a test of the Faust voice synthesis system. I am speaking in sentence-sequential mode to preserve natural prosody."

    html_content = generate_html(text)
    output_file = "faust_voice_test.html"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"HTML test page written to: {output_file}")
    print(f"Text length: {len(text.split())} words")
    print("Open this file in a web browser to listen to the voice.")

if __name__ == "__main__":
    main()