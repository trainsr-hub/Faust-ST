#!/usr/bin/env python3
"""
Test sentence-sequential with long sentences.
"""

import sys
sys.path.append('backend/voice')
from speech import speak_by_sentence

# Long sentences (each is a single sentence with many words)
LONG_SENTENCES = [
    "The Blue Rose backend serves as the single source of truth for all persistent resources in the Faust ecosystem, managing projects ranging from Universe 25's plugin-based Web-OS architecture to the music app's static data, event logs, and inventory through a sophisticated five-tier SQLite architecture and ETL flows that ensure data integrity and consistency across all applications and services.",
    "Faust's acoustic engine utilizes the Kokoro-82M ONNX model with voice af_bella at speed 0.84 and pitch shift -0.3 semitones, employing sophisticated audio queueing with overlap-add crossfading to stitch chunks together while preserving prosodic naturalness through careful attention to linguistic boundaries and contextual synthesis.",
    "In our comparative evaluation of chunking strategies we found that sentence-sequential processing provides the optimal balance between time-to-first-audio and perceptual quality, maintaining the full linguistic context necessary for the neural TTS model to generate expressive pitch contours, natural duration modeling, and appropriate breath pauses that contribute to human-like speech patterns."
]

def main():
    print("Testing sentence-sequential with long sentences...")
    print("=" * 60)

    for i, sentence in enumerate(LONG_SENTENCES, start=1):
        print(f"\nSentence {i}:")
        print(f"Length: {len(sentence.split())} words")
        print(f"Preview: {sentence[:100]}...")
        print("-" * 40)

        # Speak the sentence
        speak_by_sentence(sentence, block=True)

        print(f"Finished sentence {i}")
        print("=" * 60)

if __name__ == "__main__":
    main()