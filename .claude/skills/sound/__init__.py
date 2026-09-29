"""
Faust Acoustic Core - Unified Speech API
=========================================
Single unified interface for all Faust voice channels.

Usage:
    from sound import speak
    speak("Hello Manager")                           # PC Speakers
    speak("Hello Manager", to="esp32")               # ESP32 Speaker
"""
import base64
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Optional

SKILL_ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = Path(__file__).resolve().parents[3]
if str(SKILL_ROOT) not in sys.path:
    sys.path.insert(0, str(SKILL_ROOT))

from sound.scripts.engine import get_engine
from sound.scripts.config import (
    DEFAULT_CONFIG,
    load_rom_config,
    is_acoustic_presence_enabled,
    set_acoustic_presence_enabled,
    toggle_acoustic_presence,
)

DAEMON_HOST = os.getenv("FAUST_AUDIO_HOST", "127.0.0.1")
DAEMON_PORT = int(os.getenv("FAUST_AUDIO_PORT", "20129"))
DAEMON_SCRIPT = SKILL_ROOT / "daemon" / "audio_daemon.py"


def _spawn_background_process(script_path: Path) -> Optional[subprocess.Popen]:
    """Spawn a detached, windowless background Python process without popping up terminal windows."""
    if not script_path.exists():
        return None

    python_exe = sys.executable
    if os.name == "nt":
        creationflags = (
            subprocess.CREATE_NEW_PROCESS_GROUP
            | subprocess.DETACHED_PROCESS
            | subprocess.CREATE_NO_WINDOW
        )
        return subprocess.Popen(
            [python_exe, str(script_path)],
            cwd=str(PROJECT_ROOT),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creationflags,
        )
    else:
        return subprocess.Popen(
            [python_exe, str(script_path)],
            cwd=str(PROJECT_ROOT),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True,
        )


def is_daemon_running() -> bool:
    """Check if the resident audio daemon is currently alive."""
    try:
        req = urllib.request.Request(f"http://{DAEMON_HOST}:{DAEMON_PORT}/health", headers={"User-Agent": "Faust-Sound-Client/1.0"})
        with urllib.request.urlopen(req, timeout=0.5) as resp:
            return resp.status == 200
    except Exception:
        return False


def ensure_daemon_running(timeout: float = 0.5) -> bool:
    """
    Universal Self-Bootstrapping Daemon Invariant:
    If audio_daemon is not running, automatically spawn it windowless in the background.
    If already running, simply pass.
    """
    if not is_acoustic_presence_enabled():
        return False

    if not is_daemon_running():
        _spawn_background_process(DAEMON_SCRIPT)
        if timeout > 0:
            t0 = time.time()
            while time.time() - t0 < timeout:
                if is_daemon_running():
                    return True
                time.sleep(0.1)

    return is_daemon_running()


def speak(text: str, to: str = "speaker", **kwargs) -> bool:
    """
    Unified speech synthesis function.
    Soft-coded dual-tier architecture:
      Tier 1: Dispatches to resident daemon (0ms latency, zero overhead).
      Tier 2: Transparent in-process fallback if daemon is offline (resilient on any machine).

    Args:
        text: Speech text to synthesize
        to: Output channel - "speaker" (PC) or "esp32" (field speaker)
        **kwargs: Voice parameters (voice, speed, pitch_shift, etc.)

    Returns:
        True if transmission succeeded
    """
    if not is_acoustic_presence_enabled():
        return True

    if to == "esp32":
        return _speak_to_esp32(text, **kwargs)

    # 1. Tier 1: Try resident daemon first
    dispatched = _dispatch(text, "/speak", **kwargs)
    if dispatched:
        return True

    # 2. Tier 2: Transparent in-process fallback if daemon is offline
    try:
        engine_kwargs = {}
        supported = {
            "voice", "secondary_voice", "blend_voice", "speed",
            "pitch_shift", "pause_duration", "block", "save_path",
            "broadcast_subtitle", "normalization_type", "pipelined"
        }
        for k, v in kwargs.items():
            if k in supported and v is not None:
                engine_kwargs[k] = v

        engine = get_engine()
        engine.speak(text=text, **engine_kwargs)
        return True
    except Exception:
        return False


def _dispatch(text: str, endpoint: str = "/speak", **kwargs) -> bool:
    """Dispatch to resident daemon (with lazy self-bootstrapping)."""
    if not is_acoustic_presence_enabled():
        return True

    if not is_daemon_running():
        ensure_daemon_running(timeout=0.2)

    url = f"http://{DAEMON_HOST}:{DAEMON_PORT}{endpoint}"
    payload: dict = {"text": text}
    for k in kwargs:
        if kwargs[k] is not None:
            payload[k] = kwargs[k]

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        timeout = 60.0 if payload.get("block", False) else 3.0
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status == 200
    except Exception:
        return False


def _speak_to_esp32(text: str, **kwargs) -> bool:
    """Stream speech to ESP32 field speaker with dual-tier fallback."""
    pcm_bytes = None
    sample_rate = 24000

    # 1. Tier 1: Synthesize via shared daemon if online
    url = f"http://{DAEMON_HOST}:{DAEMON_PORT}/synthesize"
    payload = {"text": text, "target_sample_rate": 24000}
    for k in ["voice", "secondary_voice", "blend_voice", "speed", "pitch_shift", "normalization_type"]:
        if kwargs.get(k) is not None:
            payload[k] = kwargs[k]

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10.0) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            if res.get("status") == "ok":
                pcm_bytes = base64.b64decode(res["pcm_base64"])
                sample_rate = res["sample_rate"]
    except Exception:
        pcm_bytes = None

    # 2. Tier 2: In-process fallback if daemon is unreachable
    if pcm_bytes is None:
        try:
            engine_kwargs = {}
            supported = {
                "voice", "secondary_voice", "blend_voice", "speed",
                "pitch_shift", "pause_duration", "normalization_type"
            }
            for k, v in kwargs.items():
                if k in supported and v is not None:
                    engine_kwargs[k] = v

            engine = get_engine()
            samples_np, sr = engine.synthesize(text=text, **engine_kwargs)
            if len(samples_np) == 0:
                return False
            pcm_bytes = samples_np.tobytes()
            sample_rate = sr
        except Exception:
            return False

    # Stream to ESP32
    try:
        import numpy as np
        import serial
    except ImportError:
        return False

    samples = np.frombuffer(pcm_bytes, dtype=np.int16)
    gain = kwargs.get("gain", 0.40)
    if gain != 1.0:
        samples = np.clip(samples.astype(np.float32) * gain, -32768, 32767).astype(np.int16)

    stream_bytes = samples.tobytes()
    port = kwargs.get("port", "COM5")
    baud = kwargs.get("baud", 921600)
    chunk_size = kwargs.get("chunk_size", 512)

    try:
        ser = serial.Serial()
        ser.port = port
        ser.baudrate = baud
        ser.timeout = 0.5
        ser.dtr = False
        ser.rts = False
        ser.open()
        try:
            ser.setDTR(False)
            ser.setRTS(True)
            time.sleep(0.05)
            ser.setRTS(False)
            time.sleep(0.3)

            total = len(stream_bytes)
            sent = 0
            t0 = time.perf_counter()
            bytes_per_sec = sample_rate * 2

            while sent < total:
                chunk = stream_bytes[sent:sent + chunk_size]
                ser.write(chunk)
                sent += len(chunk)
                lead = (sent / bytes_per_sec) - (time.perf_counter() - t0)
                if lead > 0.15:
                    time.sleep(lead - 0.10)

            ser.flush()
            time.sleep(1.0)
            return True
        finally:
            ser.close()
    except Exception:
        return False


def preload():
    """Preload and warmup the acoustic engine."""
    return get_engine().preload()


def shutdown():
    """Shutdown the acoustic engine."""
    return get_engine().shutdown()


def synthesize(text: str, **kwargs):
    """Synthesize speech to raw PCM (in-process fallback)."""
    return get_engine().synthesize(text, **kwargs)


def list_voices():
    """List all available voices."""
    return get_engine().list_voices()


__all__ = [
    "speak",
    "preload",
    "shutdown",
    "synthesize",
    "list_voices",
    "is_daemon_running",
    "ensure_daemon_running",
    "is_acoustic_presence_enabled",
    "set_acoustic_presence_enabled",
    "toggle_acoustic_presence",
    "load_rom_config",
]