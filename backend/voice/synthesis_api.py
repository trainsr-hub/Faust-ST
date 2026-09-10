#!/usr/bin/env python3
"""
Voice synthesis API endpoint for Faust voice parameter testing.
"""

import sys
import os
import io
import numpy as np
import torch
import torchaudio
import wave
from kokoro_onnx import Kokoro
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# Add the backend/voice directory to path
sys.path.append(str(Path(__file__).parent))

from speech import Synthesizer  # We'll reuse or adapt this

router = APIRouter(prefix="/api/v1/voice", tags=["voice"])

class VoiceSynthesisRequest(BaseModel):
    text: str
    voice: str = "af_bella"
    speed: float = 0.84
    language: str = "en-us"
    pitch_shift: float = -0.3
    pause_between_sentences: float = 0.3
    sample_rate: int = 24000

class VoiceSynthesizer:
    def __init__(self):
        self.sample_rate = 24000
        model_path = Path(__file__).parent / "models" / "kokoro-v1.0.onnx"
        voices_path = Path(__file__).parent / "models" / "voices-v1.0.bin"
        self.kokoro = Kokoro(str(model_path), str(voices_path))

    def synthesize_text(self, text: str, voice: str, speed: float, language: str, pitch_shift: float) -> np.ndarray:
        """Synthesizes text to float32 numpy array in [-1, 1]"""
        if not text.strip():
            return np.array([], dtype=np.float32)

        samples, _ = self.kokoro.create(
            text.strip(),
            voice=voice,
            speed=speed,
            lang=language
        )

        # Apply pitch shift
        if pitch_shift != 0.0:
            samples_tensor = torch.from_numpy(samples).float().unsqueeze(0)
            pitch_shift_effect = torchaudio.transforms.PitchShift(
                sample_rate=self.sample_rate,
                n_steps=pitch_shift
            )
            shifted_tensor = pitch_shift_effect(samples_tensor)
            samples = shifted_tensor.squeeze(0).detach().numpy()

        # Normalize
        if len(samples) > 0:
            peak = np.max(np.abs(samples))
            if peak > 0:
                samples = samples * (0.9 / peak)

        return samples.astype(np.float32)

    def synthesize_with_pauses(self, text: str, voice: str, speed: float, language: str, pitch_shift: float, pause_duration: float) -> np.ndarray:
        """Synthesize text with pauses between sentences."""
        import re

        # Split into sentences
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        sentences = [s.strip() for s in sentences if s.strip()]

        if not sentences:
            return np.array([], dtype=np.float32)

        # Synthesize each sentence and concatenate with pauses
        audio_parts = []
        synthesizer = VoiceSynthesizer()  # Reuse the same synthesizer instance

        for i, sentence in enumerate(sentences):
            # Synthesize the sentence
            sentence_audio = synthesizer.synthesize_text(
                sentence, voice, speed, language, pitch_shift
            )

            if len(sentence_audio) > 0:
                audio_parts.append(sentence_audio)

                # Add pause after each sentence except the last
                if i < len(sentences) - 1 and pause_duration > 0:
                    pause_samples = int(pause_duration * self.sample_rate)
                    pause_audio = np.zeros(pause_samples, dtype=np.float32)
                    audio_parts.append(pause_audio)

        if audio_parts:
            return np.concatenate(audio_parts)
        else:
            return np.array([], dtype=np.float32)

@router.post("/synthesize")
async def synthesize_voice(request: VoiceSynthesisRequest):
    """
    Synthesize voice with given parameters and return audio as WAV stream.
    """
    try:
        synthesizer = VoiceSynthesizer()

        # Synthesize with pauses between sentences
        audio = synthesizer.synthesize_with_pauses(
            text=request.text,
            voice=request.voice,
            speed=request.speed,
            language=request.language,
            pitch_shift=request.pitch_shift,
            pause_duration=request.pause_between_sentences
        )

        if len(audio) == 0:
            raise HTTPException(status_code=400, detail="No audio generated from input text")

        # Convert to 16-bit PCM WAV
        audio_int16 = (np.clip(audio, -1.0, 1.0) * 32767).astype(np.int16)

        # Create WAV in memory using standard wave module
        buffer = io.BytesIO()
        with wave.open(buffer, 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)  # 16-bit
            wf.setframerate(request.sample_rate)
            wf.writeframes(audio_int16.tobytes())

        buffer.seek(0)

        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(buffer.read()),
            media_type="audio/wav",
            headers={"Content-Disposition": "inline; filename=faust_voice.wav"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice synthesis failed: {str(e)}")

# Function to include this router in the main app
def include_voice_router(app):
    """Include the voice synthesis router in the main FastAPI app."""
    app.include_router(router)