#!/usr/bin/env python3
"""
Test script to verify that sentence-separate speaking works without overlap.
"""

import sys
sys.path.append('backend/voice')
from speech import speak_by_sentence

# Simple test with clear sentence boundaries
test_text = "First sentence is here. Second sentence follows after a pause. Third sentence completes the trilogy."

print("Testing sentence separation...")
print(f"Text: {test_text}")
print("-" * 50)

# Speak with blocking to ensure clean separation
speak_by_sentence(test_text, block=True)

print("-" * 50)
print("Test complete. Sentences should have played with clear separation.")