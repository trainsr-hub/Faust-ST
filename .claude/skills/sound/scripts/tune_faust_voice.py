"""
Faust Voice Parameter Tuning Tool
Located inside plugins/sound/tools/ for evaluating acoustic parameters.
"""
import os
import sys
from pathlib import Path
import numpy as np

# Add plugin parent to path
PLUGIN_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PLUGIN_DIR.parent.parent))

from plugins.sound import speak, synthesize, list_voices, SoundEngine
from plugins.sound.config import PRIMARY_MODEL_PATH, PRIMARY_VOICES_PATH


def run_parameter_sweep():
    """Run parameter sweep across speeds and pitches."""
    voices = list_voices()
    print(f"Available voices: {len(voices)}")

    test_sentence = "Faust acoustic presence calibrated. Ready for strategic directives, Manager."
    speeds = [0.80, 0.84, 0.88, 0.92]
    pitches = [-0.5, -0.3, -0.1, 0.0]

    output_dir = PLUGIN_DIR / "samples" / "sweep"
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Running sweep on sentence: '{test_sentence}'")
    engine = SoundEngine()

    for speed in speeds:
        for pitch in pitches:
            filename = f"faust_af_bella_spd{int(speed*100)}_ptc{int(pitch*10)}.wav"
            filepath = output_dir / filename
            print(f"Synthesizing: speed={speed:.2f}, pitch={pitch:.1f} -> {filename}")
            engine.speak(
                text=test_sentence,
                voice="af_bella",
                speed=speed,
                pitch_shift=pitch,
                block=False,
                save_path=filepath,
                broadcast_subtitle=False,
            )

    print(f"Sweep complete. Files saved in {output_dir}")


if __name__ == "__main__":
    run_parameter_sweep()
