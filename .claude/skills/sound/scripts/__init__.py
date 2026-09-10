"""
Faust Sound Plugin
Self-contained acoustic core for Faust speech synthesis and playback.
"""
from typing import List, Optional, Tuple, Union
from pathlib import Path
import numpy as np

from .config import (
    DEFAULT_CONFIG,
    RMS_TEST_CONFIG,
    VoiceConfig,
    is_acoustic_presence_enabled,
    set_acoustic_presence_enabled,
    toggle_acoustic_presence,
    load_rom_config,
    save_rom_config,
)
from .engine import SoundEngine, get_engine


def speak(
    text: str,
    voice: Optional[str] = None,
    secondary_voice: Optional[str] = None,
    blend_voice: Optional[bool] = None,
    speed: Optional[float] = None,
    pitch_shift: Optional[float] = None,
    pause_duration: Optional[float] = None,
    block: bool = True,
    save_path: Optional[Union[str, Path]] = None,
    broadcast_subtitle: bool = True,
    normalization_type: Optional[str] = None,
    pipelined: bool = True,
) -> Tuple[Optional[np.ndarray], int]:
    """
    Direct function to have Faust speak text with Smart Dual-Mode.
    Tries resident audio daemon first for 0ms cold-start; falls back to in-process synthesis.
    """
    if not save_path:
        try:
            from faust_plugins.sound import _try_daemon_speak
            if _try_daemon_speak(
                text=text,
                voice=voice,
                secondary_voice=secondary_voice,
                blend_voice=blend_voice,
                speed=speed,
                pitch_shift=pitch_shift,
                pause_duration=pause_duration,
                normalization_type=normalization_type,
                block=block,
            ):
                return None, DEFAULT_CONFIG.sample_rate
        except Exception:
            pass

    engine = get_engine()
    return engine.speak(
        text=text,
        voice=voice,
        secondary_voice=secondary_voice,
        blend_voice=blend_voice,
        speed=speed,
        pitch_shift=pitch_shift,
        pause_duration=pause_duration,
        block=block,
        save_path=save_path,
        broadcast_subtitle=broadcast_subtitle,
        normalization_type=normalization_type,
        pipelined=pipelined,
    )


def synthesize(
    text: str,
    voice: Optional[str] = None,
    secondary_voice: Optional[str] = None,
    blend_voice: Optional[bool] = None,
    speed: Optional[float] = None,
    pitch_shift: Optional[float] = None,
    pause_duration: Optional[float] = None,
    language: Optional[str] = None,
    normalization_type: Optional[str] = None,
    enable_jitter: Optional[bool] = None,
) -> Tuple[np.ndarray, int]:
    """
    Synthesize speech audio samples without playing them.

    Returns:
        Tuple[np.ndarray, int]: (samples_int16, sample_rate)
    """
    engine = get_engine()
    return engine.synthesize(
        text=text,
        voice=voice,
        secondary_voice=secondary_voice,
        blend_voice=blend_voice,
        speed=speed,
        pitch_shift=pitch_shift,
        pause_duration=pause_duration,
        language=language,
        normalization_type=normalization_type,
        enable_jitter=enable_jitter,
    )


def preload() -> None:
    """Preload neural models and prime the acoustic core during startup."""
    get_engine().preload()


def shutdown() -> None:
    """Release audio handles and terminate background subtitle workers."""
    get_engine().shutdown()


def list_voices() -> List[str]:
    """List all available Kokoro voice presets."""
    return get_engine().list_voices()


__all__ = [
    "speak",
    "synthesize",
    "preload",
    "shutdown",
    "list_voices",
    "is_acoustic_presence_enabled",
    "set_acoustic_presence_enabled",
    "toggle_acoustic_presence",
    "load_rom_config",
    "save_rom_config",
    "SoundEngine",
    "VoiceConfig",
    "DEFAULT_CONFIG",
    "RMS_TEST_CONFIG",
    "get_engine",
]
