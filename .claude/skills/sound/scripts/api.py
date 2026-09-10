"""
Faust Sound Plugin - FastAPI Router
Provides REST API endpoints for Faust speech synthesis.
"""
import io
import wave
from typing import Optional
import numpy as np
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from .engine import get_engine
from .config import (
    DEFAULT_CONFIG,
    load_rom_config,
    save_rom_config,
    is_acoustic_presence_enabled,
    set_acoustic_presence_enabled,
    toggle_acoustic_presence,
)

router = APIRouter(prefix="/api/v1/voice", tags=["voice"])


class VoiceSynthesisRequest(BaseModel):
    text: str = Field(..., description="Text for Faust to synthesize")
    voice: str = Field(default=DEFAULT_CONFIG.voice, description="Primary voice preset")
    secondary_voice: str = Field(default=DEFAULT_CONFIG.voice_blend_secondary, description="Secondary blend voice")
    blend_voice: bool = Field(default=DEFAULT_CONFIG.voice_blend_enabled, description="Enable random voice blending")
    speed: float = Field(default=DEFAULT_CONFIG.speed, description="Speed multiplier")
    language: str = Field(default=DEFAULT_CONFIG.language, description="Language code")
    pitch_shift: float = Field(default=DEFAULT_CONFIG.pitch_shift, description="Pitch shift in semitones")
    pause_between_sentences: float = Field(default=DEFAULT_CONFIG.pause_duration, description="Pause duration in seconds")
    normalization_type: str = Field(default=DEFAULT_CONFIG.normalization_type, description="'peak' (breathy) or 'rms' (even)")
    enable_jitter: bool = Field(default=DEFAULT_CONFIG.prosody_jitter_enabled, description="Enable prosody micro-jitter")


@router.get("/voices")
async def get_available_voices():
    """Get list of available voices for Faust's acoustic core."""
    engine = get_engine()
    voices = engine.list_voices()
    return {
        "available_voices": voices,
        "default_voice": DEFAULT_CONFIG.voice,
        "secondary_voice": DEFAULT_CONFIG.voice_blend_secondary,
        "faust_preset": {
            "voice": DEFAULT_CONFIG.voice,
            "secondary_voice": DEFAULT_CONFIG.voice_blend_secondary,
            "speed": DEFAULT_CONFIG.speed,
            "pitch_shift": DEFAULT_CONFIG.pitch_shift,
            "pause_duration": DEFAULT_CONFIG.pause_duration,
            "normalization": DEFAULT_CONFIG.normalization_type,
            "description": "Faust nonchalant acoustic core with dynamic neural style blending & prosody jitter."
        }
    }


@router.post("/preload")
async def preload_acoustic_core():
    """Eagerly preload model weights and warm up the acoustic engine."""
    engine = get_engine()
    engine.preload()
    return {"status": "ok", "message": "Faust acoustic core preloaded and warmed up."}


from .engine import get_engine
from .config import (
    DEFAULT_CONFIG,
    load_rom_config,
    save_rom_config,
    is_acoustic_presence_enabled,
    set_acoustic_presence_enabled,
    toggle_acoustic_presence,
)

from pydantic import BaseModel
from typing import Optional, Dict, Any


class VoiceConfigUpdate(BaseModel):
    """Update parameters for the acoustic_presence section of ROM config."""
    enabled: Optional[bool] = None
    voice: Optional[str] = None
    secondary_voice: Optional[str] = None
    voice_blend_enabled: Optional[bool] = None
    normalization_type: Optional[str] = None
    speed: Optional[float] = None
    pitch_shift: Optional[float] = None
    pause_duration: Optional[float] = None
    prosody_jitter_enabled: Optional[bool] = None
    pipelined_playback: Optional[bool] = None
    websocket_subtitles: Optional[bool] = None
    websocket_subtitle_url: Optional[str] = None


@router.get("/config")
async def get_voice_config():
    """Get the current ROM configuration for Faust's acoustic presence."""
    cfg = load_rom_config()
    acoustic_cfg = cfg.get("acoustic_presence", {})
    return {
        "acoustic_presence": acoustic_cfg,
        "effective_enabled": is_acoustic_presence_enabled(),
    }


@router.post("/config")
async def update_voice_config(update: VoiceConfigUpdate):
    """Update the acoustic_presence section of the persistent ROM configuration."""
    cfg = load_rom_config()
    if "acoustic_presence" not in cfg or not isinstance(cfg["acoustic_presence"], dict):
        cfg["acoustic_presence"] = {}

    # Update only the fields that are provided (not None)
    update_data = update.dict(exclude_unset=True)
    for key, value in update_data.items():
        cfg["acoustic_presence"][key] = value

    save_rom_config(cfg)
    return {
        "status": "ok",
        "message": "ROM configuration updated.",
        "acoustic_presence": cfg["acoustic_presence"],
    }


@router.post("/toggle")
async def toggle_voice_config():
    """Toggle Faust's acoustic presence on/off in ROM config."""
    new_state = toggle_acoustic_presence()
    state_str = "ENABLED (Vocal)" if new_state else "MUTED (Silent)"
    return {
        "status": "ok",
        "message": f"Acoustic presence toggled -> {state_str}",
        "enabled": new_state,
    }


@router.post("/synthesize")
async def synthesize_voice_endpoint(request: VoiceSynthesisRequest):
    """Synthesize voice with requested parameters and return audio as a streaming WAV."""
    try:
        engine = get_engine()
        samples, sample_rate = engine.synthesize(
            text=request.text,
            voice=request.voice,
            secondary_voice=request.secondary_voice,
            blend_voice=request.blend_voice,
            speed=request.speed,
            pitch_shift=request.pitch_shift,
            pause_duration=request.pause_between_sentences,
            language=request.language,
            normalization_type=request.normalization_type,
            enable_jitter=request.enable_jitter,
        )

        if len(samples) == 0:
            raise HTTPException(status_code=400, detail="No audio generated from input text")

        buffer = io.BytesIO()
        with wave.open(buffer, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)  # 16-bit
            wf.setframerate(sample_rate)
            wf.writeframes(samples.tobytes())

        buffer.seek(0)
        return StreamingResponse(
            buffer,
            media_type="audio/wav",
            headers={"Content-Disposition": "inline; filename=faust_voice.wav"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice synthesis failed: {str(e)}")


def include_voice_router(app):
    """Include the voice synthesis router in a FastAPI application."""
    app.include_router(router)
