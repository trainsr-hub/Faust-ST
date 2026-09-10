#!/usr/bin/env python3
"""
Faust Acoustic Core - Multi-Method Chunking Benchmark & Comparative Test Suite.
Evaluates:
  1. Micro-Chunked (3-5 words)
  2. Clause-Chunked (Phrases / commas)
  3. Sentence-Sequential (One sentence at a time, synchronous)
  4. Sentence-Pipelined (Asynchronous pre-buffering across sentence boundaries)
  5. Monolithic Baseline (Full text without chunking)
"""

import sys
import os
import re
import time
import queue
import threading
from pathlib import Path
import numpy as np
import sounddevice as sd
import torch
import torchaudio
from kokoro_onnx import Kokoro

# Paths
BASE_DIR = Path(__file__).parent
MODEL_PATH = BASE_DIR / "models" / "kokoro-v1.0.onnx"
VOICES_PATH = BASE_DIR / "models" / "voices-v1.0.bin"

# Sample Test Text (Rich Faust/Blue Rose narrative with clear sentence structures)
BENCHMARK_TEXT = (
    "The Blue Rose backend is the single source of truth for persistent resources using a five-tier SQLite architecture. "
    "It handles projects like Universe 25 and music app managing static data, event logs, and inventory with ETL flows. "
    "Faust relies on it for state persistence across sessions."
)

class AcousticEngine:
    def __init__(self, voice="af_bella", speed=0.84, language="en-us", pitch_shift=-0.3):
        self.voice = voice
        self.speed = speed
        self.language = language
        self.pitch_shift = pitch_shift
        self.sample_rate = 24000
        self.kokoro = Kokoro(str(MODEL_PATH), str(VOICES_PATH))

    def synthesize_text(self, text):
        """Synthesizes text chunk to float32 numpy array [-1, 1]"""
        if not text.strip():
            return np.array([], dtype=np.float32)

        samples, _ = self.kokoro.create(
            text.strip(),
            voice=self.voice,
            speed=self.speed,
            lang=self.language
        )

        if self.pitch_shift != 0.0:
            samples_tensor = torch.from_numpy(samples).float().unsqueeze(0)
            pitch_shift_effect = torchaudio.transforms.PitchShift(
                sample_rate=self.sample_rate,
                n_steps=self.pitch_shift
            )
            shifted_tensor = pitch_shift_effect(samples_tensor)
            samples = shifted_tensor.squeeze(0).detach().numpy()

        if len(samples) > 0:
            peak = np.max(np.abs(samples))
            if peak > 0:
                samples = samples * (0.9 / peak)

        return samples.astype(np.float32)

def print_header(title):
    print("\n" + "=" * 80)
    print(f"  >>> TEST METHOD: {title.upper()} <<<")
    print("=" * 80)

# ==============================================================================
# METHOD 1: Micro-Chunked (3-5 words)
# ==============================================================================
def run_micro_chunked(engine, text=BENCHMARK_TEXT):
    print_header("1. Micro-Chunked (3-5 Words)")
    print("[Config] Chunk Size: 3-5 words | Streaming Playback: Immediate Queue")

    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        size = 4 if i == 0 else 5
        chunk = ' '.join(words[i:i+size])
        chunks.append(chunk)
        i += size

    print(f"[Plan] Sliced into {len(chunks)} micro-chunks.")

    audio_queue = queue.Queue()
    playback_done = threading.Event()
    metrics = {"ttfa": None, "total_synth": 0, "total_time": 0}

    def player():
        with sd.OutputStream(samplerate=engine.sample_rate, channels=1, dtype='float32') as stream:
            first = True
            while not playback_done.is_set() or not audio_queue.empty():
                try:
                    chunk_audio = audio_queue.get(timeout=0.1)
                    if first:
                        first = False
                        metrics["ttfa"] = time.perf_counter() - start_total
                        print(f"  [PLAYBACK START] >>> Time-To-First-Audio (TTFA): {metrics['ttfa']:.2f}s")
                    stream.write(chunk_audio)
                except queue.Empty:
                    continue
            time.sleep(0.15)

    start_total = time.perf_counter()
    play_th = threading.Thread(target=player, daemon=True)
    play_th.start()

    for idx, chunk in enumerate(chunks):
        t0 = time.perf_counter()
        audio = engine.synthesize_text(chunk)
        t_synth = time.perf_counter() - t0
        metrics["total_synth"] += t_synth
        audio_dur = len(audio) / engine.sample_rate
        print(f"  [Chunk {idx+1:02d}/{len(chunks):02d}] Synth: {t_synth:.2f}s | Audio: {audio_dur:.2f}s | Text: \"{chunk}\"")
        audio_queue.put(audio)

    playback_done.set()
    play_th.join()
    metrics["total_time"] = time.perf_counter() - start_total
    print(f"[Completed] TTFA: {metrics['ttfa']:.2f}s | Total Wall-Clock: {metrics['total_time']:.2f}s\n")
    return metrics

# ==============================================================================
# METHOD 2: Clause / Punctuation-Chunked (Phrases)
# ==============================================================================
def run_clause_chunked(engine, text=BENCHMARK_TEXT):
    print_header("2. Clause / Phrase-Chunked (Punctuation Slicing)")
    print("[Config] Slicing by commas, semicolons, and sentence boundaries")

    # Split by punctuation
    raw_clauses = re.split(r'(?<=[,;:.!?])\s+', text.strip())
    clauses = [c.strip() for c in raw_clauses if c.strip()]
    print(f"[Plan] Sliced into {len(clauses)} clauses/phrases.")

    audio_queue = queue.Queue()
    playback_done = threading.Event()
    metrics = {"ttfa": None, "total_synth": 0, "total_time": 0}

    def player():
        with sd.OutputStream(samplerate=engine.sample_rate, channels=1, dtype='float32') as stream:
            first = True
            while not playback_done.is_set() or not audio_queue.empty():
                try:
                    chunk_audio = audio_queue.get(timeout=0.1)
                    if first:
                        first = False
                        metrics["ttfa"] = time.perf_counter() - start_total
                        print(f"  [PLAYBACK START] >>> Time-To-First-Audio (TTFA): {metrics['ttfa']:.2f}s")
                    stream.write(chunk_audio)
                except queue.Empty:
                    continue
            time.sleep(0.15)

    start_total = time.perf_counter()
    play_th = threading.Thread(target=player, daemon=True)
    play_th.start()

    for idx, clause in enumerate(clauses):
        t0 = time.perf_counter()
        audio = engine.synthesize_text(clause)
        t_synth = time.perf_counter() - t0
        metrics["total_synth"] += t_synth
        audio_dur = len(audio) / engine.sample_rate
        print(f"  [Clause {idx+1:02d}/{len(clauses):02d}] Synth: {t_synth:.2f}s | Audio: {audio_dur:.2f}s | Text: \"{clause}\"")
        audio_queue.put(audio)

    playback_done.set()
    play_th.join()
    metrics["total_time"] = time.perf_counter() - start_total
    print(f"[Completed] TTFA: {metrics['ttfa']:.2f}s | Total Wall-Clock: {metrics['total_time']:.2f}s\n")
    return metrics

# ==============================================================================
# METHOD 3: Complete Sentence-by-Sentence (Synchronous Flush)
# ==============================================================================
def run_sentence_sequential(engine, text=BENCHMARK_TEXT):
    print_header("3. Sentence-by-Sentence Sequential (Atomic Sentence Chunking)")
    print("[Config] Slicing by full sentences. Each sentence is synthesized and played synchronously.")

    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [s.strip() for s in sentences if s.strip()]
    print(f"[Plan] Sliced into {len(sentences)} complete sentences.")

    metrics = {"ttfa": None, "total_synth": 0, "total_time": 0}
    start_total = time.perf_counter()

    with sd.OutputStream(samplerate=engine.sample_rate, channels=1, dtype='float32') as stream:
        for idx, sentence in enumerate(sentences):
            print(f"  [Sentence {idx+1}/{len(sentences)}] Synthesizing: \"{sentence[:60]}...\"")
            t0 = time.perf_counter()
            audio = engine.synthesize_text(sentence)
            t_synth = time.perf_counter() - t0
            metrics["total_synth"] += t_synth
            audio_dur = len(audio) / engine.sample_rate

            if metrics["ttfa"] is None:
                metrics["ttfa"] = time.perf_counter() - start_total
                print(f"  [PLAYBACK START] >>> Time-To-First-Audio (TTFA): {metrics['ttfa']:.2f}s")

            print(f"  [Sentence {idx+1}/{len(sentences)}] Playing audio ({audio_dur:.2f}s)...")
            stream.write(audio)

        time.sleep(0.15)

    metrics["total_time"] = time.perf_counter() - start_total
    print(f"[Completed] TTFA: {metrics['ttfa']:.2f}s | Total Wall-Clock: {metrics['total_time']:.2f}s\n")
    return metrics

# ==============================================================================
# METHOD 4: Sentence-Pipelined (Asynchronous Producer-Consumer Streaming)
# ==============================================================================
def run_sentence_pipelined(engine, text=BENCHMARK_TEXT):
    print_header("4. Sentence-Pipelined Streaming (Asynchronous Pre-buffering)")
    print("[Config] Slicing by full sentences. S2 synthesizes concurrently while S1 is speaking.")

    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [s.strip() for s in sentences if s.strip()]
    print(f"[Plan] Sliced into {len(sentences)} complete sentences.")

    audio_queue = queue.Queue()
    synth_done = threading.Event()
    metrics = {"ttfa": None, "total_synth": 0, "total_time": 0}

    def synthesizer():
        for idx, sentence in enumerate(sentences):
            t0 = time.perf_counter()
            print(f"  [Synth Worker] Synthesizing Sentence {idx+1}/{len(sentences)}: \"{sentence[:55]}...\"")
            audio = engine.synthesize_text(sentence)
            t_synth = time.perf_counter() - t0
            metrics["total_synth"] += t_synth
            audio_dur = len(audio) / engine.sample_rate
            print(f"  [Synth Worker] S{idx+1} ready ({t_synth:.2f}s compute, {audio_dur:.2f}s audio) -> Queued")
            audio_queue.put((idx+1, audio, sentence))
        synth_done.set()

    def player():
        with sd.OutputStream(samplerate=engine.sample_rate, channels=1, dtype='float32') as stream:
            first = True
            while not synth_done.is_set() or not audio_queue.empty():
                try:
                    s_idx, audio, s_text = audio_queue.get(timeout=0.1)
                    if first:
                        first = False
                        metrics["ttfa"] = time.perf_counter() - start_total
                        print(f"  [PLAYBACK START] >>> Time-To-First-Audio (TTFA): {metrics['ttfa']:.2f}s")
                    audio_dur = len(audio) / engine.sample_rate
                    print(f"  [Speaker Output] Playing Sentence {s_idx}/{len(sentences)} ({audio_dur:.2f}s)...")
                    stream.write(audio)
                    print(f"  [Speaker Output] Sentence {s_idx} finished.")
                except queue.Empty:
                    continue
            time.sleep(0.15)

    start_total = time.perf_counter()
    s_th = threading.Thread(target=synthesizer, daemon=True)
    p_th = threading.Thread(target=player, daemon=True)

    s_th.start()
    p_th.start()

    s_th.join()
    p_th.join()

    metrics["total_time"] = time.perf_counter() - start_total
    print(f"[Completed] TTFA: {metrics['ttfa']:.2f}s | Total Wall-Clock: {metrics['total_time']:.2f}s\n")
    return metrics

# ==============================================================================
# METHOD 5: Monolithic Baseline (Full Text No Chunking)
# ==============================================================================
def run_monolithic(engine, text=BENCHMARK_TEXT):
    print_header("5. Monolithic Baseline (No Chunking - Golden Prosody)")
    print("[Config] Entire text synthesized in a single monolithic pass.")

    metrics = {"ttfa": None, "total_synth": 0, "total_time": 0}
    start_total = time.perf_counter()

    print(f"  [Monolithic] Synthesizing entire text ({len(text.split())} words)...")
    t0 = time.perf_counter()
    audio = engine.synthesize_text(text)
    t_synth = time.perf_counter() - t0
    metrics["total_synth"] = t_synth
    audio_dur = len(audio) / engine.sample_rate

    metrics["ttfa"] = time.perf_counter() - start_total
    print(f"  [Synth Done] Computed in {t_synth:.2f}s ({audio_dur:.2f}s audio).")
    print(f"  [PLAYBACK START] >>> Time-To-First-Audio (TTFA): {metrics['ttfa']:.2f}s")

    with sd.OutputStream(samplerate=engine.sample_rate, channels=1, dtype='float32') as stream:
        stream.write(audio)
        time.sleep(0.15)

    metrics["total_time"] = time.perf_counter() - start_total
    print(f"[Completed] TTFA: {metrics['ttfa']:.2f}s | Total Wall-Clock: {metrics['total_time']:.2f}s\n")
    return metrics

def main():
    print("\n" + "#" * 80)
    print("  FAUST ACOUSTIC CORE: MULTI-CHUNKING METHOD COMPARATIVE EVALUATION")
    print("#" * 80)
    print(f"Target Text:\n\"{BENCHMARK_TEXT}\"\n")

    engine = AcousticEngine()

    if len(sys.argv) > 1:
        choice = sys.argv[1].lower()
        if choice in ["1", "micro"]:
            run_micro_chunked(engine)
        elif choice in ["2", "clause"]:
            run_clause_chunked(engine)
        elif choice in ["3", "sentence", "sentence-seq"]:
            run_sentence_sequential(engine)
        elif choice in ["4", "pipeline", "sentence-pipeline"]:
            run_sentence_pipelined(engine)
        elif choice in ["5", "mono", "monolithic"]:
            run_monolithic(engine)
        else:
            print(f"Unknown method '{choice}'. Use: 1 (micro), 2 (clause), 3 (sentence), 4 (pipeline), 5 (mono), or 'all'.")
        return

    # If no args or 'all', ask or run all
    print("Available Methods to Test:")
    print("  1. Micro-Chunked (3-5 words)")
    print("  2. Clause / Phrase-Chunked (commas/phrases)")
    print("  3. Sentence Sequential (Atomic sentence, sync)")
    print("  4. Sentence Pipelined (Atomic sentence, async background overlap)")
    print("  5. Monolithic Baseline (Full text pass)")
    print("  all. Run all 5 methods sequentially with benchmark scorecard\n")

def run_all_methods(engine):
    results = {}
    print("\n" + "#" * 80)
    print("  RUNNING ALL METHODS SEQUENTIALLY FOR COMPARISON")
    print("#" * 80)
    methods = [
        ("1. Micro-Chunked (3-5 words)", run_micro_chunked),
        ("2. Clause / Phrase-Chunked (punctuation)", run_clause_chunked),
        ("3. Sentence Sequential (Atomic sentence, sync)", run_sentence_sequential),
        ("4. Sentence Pipelined (Atomic sentence, async)", run_sentence_pipelined),
        ("5. Monolithic Baseline (Full text pass)", run_monolithic)
    ]
    for name, func in methods:
        print(f"\n>>> Starting: {name}")
        metrics = func(engine)
        results[name] = metrics
        print(f"<<< Finished: {name} >>>\n")
        time.sleep(1)  # brief pause between tests

    # Summary
    print("\n" + "=" * 80)
    print("  BENCHMARK SUMMARY (lower is better for TTFA and total time)")
    print("=" * 80)
    print(f"{'Method':<45} {'TTFA (s)':>10} {'Total Time (s)':>15}")
    print("-" * 80)
    for name, metrics in results.items():
        ttfa = metrics.get('ttfa', 0)
        total = metrics.get('total_time', 0)
        print(f"{name:<45} {ttfa:>10.2f} {total:>15.2f}")
    print("-" * 80)
    # Find best TTFA and best total time
    best_ttfa = min(results.items(), key=lambda x: x[1]['ttfa'])
    best_total = min(results.items(), key=lambda x: x[1]['total_time'])
    print(f"\nBest TTFA: {best_ttfa[0]} ({best_ttfa[1]['ttfa']:.2f}s)")
    print(f"Best Total Time: {best_total[0]} ({best_total[1]['total_time']:.2f}s)")


if __name__ == "__main__":
    # If argument provided, run specific method; else run all
    if len(sys.argv) > 1:
        choice = sys.argv[1].lower()
        engine = AcousticEngine()
        if choice in ["1", "micro"]:
            run_micro_chunked(engine)
        elif choice in ["2", "clause"]:
            run_clause_chunked(engine)
        elif choice in ["3", "sentence", "sentence-seq"]:
            run_sentence_sequential(engine)
        elif choice in ["4", "pipeline", "sentence-pipeline"]:
            run_sentence_pipelined(engine)
        elif choice in ["5", "mono", "monolithic"]:
            run_monolithic(engine)
        elif choice in ["all"]:
            engine = AcousticEngine()
            run_all_methods(engine)
        else:
            print(f"Unknown method '{choice}'. Use: 1 (micro), 2 (clause), 3 (sentence), 4 (pipeline), 5 (mono), or 'all'.")
    else:
        # No arguments: show menu and ask? For simplicity, run all.
        engine = AcousticEngine()
        run_all_methods(engine)
