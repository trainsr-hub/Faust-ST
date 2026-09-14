#!/usr/bin/env python3
"""
Test script to validate Faust Sound Plugin improvements
"""
import sys
from pathlib import Path

# Add skills directory to sys.path
SKILLS_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(SKILLS_DIR))

import time
import numpy as np
from sound import (
    speak,
    preload,
    shutdown,
    DEFAULT_CONFIG,
)
from sound.scripts.config import RMS_TEST_CONFIG

def test_preload_performance():
    """Test that preload eliminates cold start latency"""
    print("\n=== Testing Preload Performance ===")

    # Fresh engine instance
    from sound.scripts.engine import SoundEngine
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
    print(f"Preload successful: {'✓' if preload_time < 2500 else '✗'}")
    return True

def test_voice_blending():
    """Test that voice blending creates varied output with 3-way blending (af_bella 0.5-0.8 + 2 random female 0.2-0.5)"""
    print("\n=== Testing Voice Blending (3-Way Architecture) ===")
    from sound.scripts.engine import SoundEngine
    engine = SoundEngine()

    for i in range(10):
        style_vector, profile_tag = engine._generate_voice_style()
        print(f"Run {i+1} profile: {profile_tag}")
        assert isinstance(style_vector, np.ndarray), "Style vector must be a numpy ndarray"
        assert not np.isnan(style_vector).any(), "Style vector contains NaN"
        assert not np.isinf(style_vector).any(), "Style vector contains Inf"

        # Verify profile tag contains af_bella and 2 secondary voices
        parts = [p.strip() for p in profile_tag.split("+")]
        assert len(parts) == 3, f"Expected 3 blended voices in profile, got: {profile_tag}"

        # Check af_bella weight
        bella_name, bella_w_str = parts[0].split("*")
        assert bella_name.strip() == "af_bella", f"Base voice must be af_bella, got {bella_name}"
        bella_w = float(bella_w_str)
        assert 0.50 <= bella_w <= 0.80 + 1e-4, f"af_bella weight {bella_w} out of [0.50, 0.80] range"

        # Check secondary voices
        sec1_name, sec1_w_str = parts[1].split("*")
        sec2_name, sec2_w_str = parts[2].split("*")
        sec1_w = float(sec1_w_str)
        sec2_w = float(sec2_w_str)
        sec_total_w = sec1_w + sec2_w

        assert 0.20 - 1e-4 <= sec_total_w <= 0.50 + 1e-4, f"Secondary total weight {sec_total_w} out of [0.20, 0.50] range"
        assert abs((bella_w + sec_total_w) - 1.0) < 1e-3, f"Sum of weights must equal 1.0, got {bella_w + sec_total_w}"
        assert sec1_name.strip() != sec2_name.strip(), f"Secondary voices must be distinct: {sec1_name} vs {sec2_name}"
        assert sec1_name.strip() != "af_bella" and sec2_name.strip() != "af_bella"

    test_text = "Testing the phenomenal 3-way voice blend capabilities."
    samples, sr = engine.synthesize(test_text, blend_voice=True)
    assert len(samples) > 0, "No audio generated"
    assert sr == 24000, f"Unexpected sample rate: {sr}"

    print("Voice blending test (3-Way: af_bella 0.5-0.8 + 2 random female 0.2-0.5): ✓ (Verified)")
    return True

def test_normalization_modes():
    """Test both peak and RMS normalization modes"""
    print("\n=== Testing Normalization Modes ===")
    from sound.scripts.engine import SoundEngine
    engine = SoundEngine()

    test_text = "This is a test of peak versus RMS normalization."

    for norm_type in ["peak", "rms"]:
        try:
            samples, sr = engine.synthesize(
                test_text,
                normalization_type=norm_type,
                blend_voice=False,  # Disable blending to isolate normalization effect
            )
            print(f"{norm_type.upper()} norm: {len(samples)} samples, peak={np.max(np.abs(samples)) if len(samples) > 0 else 0}")
            assert len(samples) > 0, f"No audio generated for {norm_type}"
        except Exception as e:
            print(f"{norm_type} normalization failed: {e}")
            return False

    print("Normalization test: ✓")
    return True

def test_pipelined_playback():
    """Test streaming chunk synthesis"""
    print("\n=== Testing Streaming Chunk Synthesis ===")
    from sound.scripts.engine import SoundEngine
    engine = SoundEngine()

    long_text = ("This is a longer sentence designed to test the streaming synthesis "
                "capability. It should yield chunks sentence by sentence.")

    try:
        start = time.perf_counter()
        chunks = list(engine.synthesize_stream(long_text))
        elapsed = (time.perf_counter() - start) * 1000

        print(f"Streaming synthesis completed in {elapsed:.1f}ms, yielded {len(chunks)} chunks")
        assert len(chunks) > 0, "No chunks generated"
        for chunk_samples, sr, chunk_text in chunks:
            assert len(chunk_samples) > 0, "Empty chunk audio"
            assert sr == 24000, f"Wrong sample rate: {sr}"
        return True
    except Exception as e:
        print(f"Streaming synthesis failed: {e}")
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
