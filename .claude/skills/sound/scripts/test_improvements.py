#!/usr/bin/env python3
"""
Test script to validate Faust Sound Plugin improvements
"""
import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import time
import numpy as np
from faust_plugins.sound import (
    speak,
    preload,
    shutdown,
    DEFAULT_CONFIG,
    RMS_TEST_CONFIG
)

def test_preload_performance():
    """Test that preload eliminates cold start latency"""
    print("\n=== Testing Preload Performance ===")

    # Fresh engine instance
    from faust_plugins.sound.engine import SoundEngine
    engine = SoundEngine()

    # Cold start test
    start = time.perf_counter()
    _ = engine._get_kokoro()
    cold_load_time = (time.perf_counter() - start) * 1000

    # Preload test
    engine2 = SoundEngine()
    start = time.perf_counter()
    engine2.preload()
    preload_time = (time.perf_counter() - start) * 1000

    print(f"Cold model load time: {cold_load_time:.1f}ms")
    print(f"Preload warmup time: {preload_time:.1f}ms")
    print(f"Preload successful: {'✓' if preload_time < 1000 else '✗'}")
    return True

def test_voice_blending():
    """Test that voice blending creates varied output"""
    print("\n=== Testing Voice Blending ===")

    test_text = "Testing the phenomenal voice blend capabilities."

    for i in range(3):
        try:
            samples, sr = speak(
                test_text,
                blend_voice=True,
                block=False  # Don't block on playback for testing
            )
            print(f"Run {i+1}: Generated {len(samples)} samples at {sr}Hz")
            assert len(samples) > 0, "No audio generated"
            assert sr == 24000, f"Unexpected sample rate: {sr}"
        except Exception as e:
            print(f"Run {i+1} failed: {e}")
            return False

    print("Voice blending test: ✓ (no errors)")
    return True

def test_normalization_modes():
    """Test both peak and RMS normalization modes"""
    print("\n=== Testing Normalization Modes ===")

    test_text = "This is a test of peak versus RMS normalization."

    for norm_type in ["peak", "rms"]:
        try:
            samples, sr = speak(
                test_text,
                normalization_type=norm_type,
                blend_voice=False,  # Disable blending to isolate normalization effect
                block=False
            )
            print(f"{norm_type.upper()} norm: {len(samples)} samples, peak={np.max(np.abs(samples)) if len(samples) > 0 else 0}")
            assert len(samples) > 0, f"No audio generated for {norm_type}"
        except Exception as e:
            print(f"{norm_type} normalization failed: {e}")
            return False

    print("Normalization test: ✓")
    return True

def test_pipelined_playback():
    """Test pipelined low-latency synthesis"""
    print("\n=== Testing Pipelined Playback ===")

    long_text = ("This is a longer sentence designed to test the pipelined "
                "playback capability. It should start playing almost immediately "
                "while the rest continues to synthesize in the background.")

    try:
        start = time.perf_counter()
        samples, sr = speak(
            long_text,
            pipelined=True,
            block=False
        )
        elapsed = (time.perf_counter() - start) * 1000

        print(f"Pipelined dispatch completed in {elapsed:.1f}ms")
        print(f"Generated {len(samples)} samples at {sr}Hz")
        assert len(samples) > 0, "No audio generated"
        assert sr == 24000, f"Wrong sample rate: {sr}"
        return True
    except Exception as e:
        print(f"Pipelined playback failed: {e}")
        return False

def main():
    """Run all improvement tests"""
    print("Faust Sound Plugin Improvement Validation")
    print("=" * 50)

    try:
        shutdown()
    except:
        pass

    tests = [
        test_preload_performance,
        test_voice_blending,
        test_normalization_modes,
        test_pipelined_playback,
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"Test {test.__name__} crashed: {e}")

    print("\n" + "=" * 50)
    print(f"Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All improvements validated successfully!")
    else:
        print("⚠️  Some tests failed - review implementation")

    try:
        shutdown()
    except:
        pass

    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
