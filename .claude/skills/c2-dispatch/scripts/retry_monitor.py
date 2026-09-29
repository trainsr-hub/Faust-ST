#!/usr/bin/env python3
"""
Faust Retry Convergence Monitor (Critical #3)
Tracks error categories across retry attempts and halts divergent compiler loops.
Implements Invariant 2: Monotonic Retry Convergence
"""

import hashlib
import json
from dataclasses import dataclass, asdict
from enum import Enum
from typing import List, Optional, Dict


class ErrorCategory(Enum):
    """Classification of compiler/runtime errors."""
    SYNTAX = "syntax"
    TYPE_ERROR = "type"
    MISSING_IMPORT = "import"
    ENVIRONMENT = "environment"
    RUNTIME = "runtime"
    UNKNOWN = "unknown"


@dataclass
class ErrorSignature:
    """Compressed representation of an error for convergence detection."""
    category: ErrorCategory
    error_hash: str  # SHA-256 hash of first 100 chars of error message
    attempt_number: int


@dataclass
class RetryAnalysis:
    """Analysis of retry pattern for a work packet."""
    packet_id: str
    should_continue: bool
    error_category: ErrorCategory
    attempt_count: int
    error_history: List[ErrorSignature]
    divergence_detected: bool
    recommendation: str


class RetryConvergenceMonitor:
    """Monitors retry patterns and detects divergent compiler loops."""

    # Error category patterns (regex-style matching)
    ERROR_PATTERNS = {
        ErrorCategory.SYNTAX: [
            "SyntaxError",
            "Parse error",
            "Unexpected token",
            "Invalid syntax",
        ],
        ErrorCategory.TYPE_ERROR: [
            "TypeError",
            "type error",
            "Property .* does not exist",
            "Cannot assign to read-only property",
            "is not assignable to type",
        ],
        ErrorCategory.MISSING_IMPORT: [
            "ModuleNotFoundError",
            "Cannot find module",
            "No module named",
            "ImportError",
            "Module not found",
        ],
        ErrorCategory.ENVIRONMENT: [
            "ENOENT",
            "No such file or directory",
            "EACCES",
            "Permission denied",
            "Package .* not found",
            "pip install",
        ],
        ErrorCategory.RUNTIME: [
            "RuntimeError",
            "AttributeError",
            "KeyError",
            "IndexError",
            "ValueError",
            "Exception:",
        ],
    }

    def __init__(self, max_retries: int = 4):
        self.max_retries = max_retries
        self.packet_history: Dict[str, List[ErrorSignature]] = {}

    def classify_error(self, error_message: str) -> ErrorCategory:
        """
        Classify error message into category.

        Args:
            error_message: Full error output from compiler/runtime

        Returns:
            ErrorCategory matching the error pattern
        """
        if not error_message:
            return ErrorCategory.UNKNOWN

        error_lower = error_message.lower()

        # Check patterns in priority order
        for category, patterns in self.ERROR_PATTERNS.items():
            for pattern in patterns:
                if pattern.lower() in error_lower:
                    return category

        return ErrorCategory.UNKNOWN

    def compute_error_hash(self, error_message: str) -> str:
        """
        Compute SHA-256 hash of error message (first 100 chars).
        Used for detecting recurring error signatures.

        Args:
            error_message: Full error output

        Returns:
            SHA-256 hash (hex) of first 100 chars
        """
        truncated = error_message[:100]
        return hashlib.sha256(truncated.encode()).hexdigest()

    def record_attempt(
        self,
        packet_id: str,
        error_message: str,
        attempt_number: int
    ) -> None:
        """
        Record a retry attempt for a packet.

        Args:
            packet_id: Unique packet identifier
            error_message: Compiler/runtime error output
            attempt_number: Current attempt (1-indexed)
        """
        category = self.classify_error(error_message)
        error_hash = self.compute_error_hash(error_message)

        signature = ErrorSignature(
            category=category,
            error_hash=error_hash,
            attempt_number=attempt_number
        )

        if packet_id not in self.packet_history:
            self.packet_history[packet_id] = []

        self.packet_history[packet_id].append(signature)

    def detect_divergence(self, packet_id: str) -> bool:
        """
        Detect if a packet is stuck in a divergent retry loop.
        Divergence = same error category appearing 3+ times in last 4 attempts.

        Args:
            packet_id: Unique packet identifier

        Returns:
            True if divergence detected, False otherwise
        """
        if packet_id not in self.packet_history:
            return False

        history = self.packet_history[packet_id]
        if len(history) < 3:
            return False

        # Check last 4 attempts for repeated category
        recent = history[-4:]
        categories = [sig.category for sig in recent]

        # Count occurrences of most frequent category
        category_counts = {}
        for cat in categories:
            category_counts[cat] = category_counts.get(cat, 0) + 1

        max_count = max(category_counts.values()) if category_counts else 0

        # Divergence if any category appears 3+ times in last 4 attempts
        return max_count >= 3

    def analyze_retry_status(
        self,
        packet_id: str,
        current_error_message: str,
        attempt_number: int
    ) -> RetryAnalysis:
        """
        Analyze current retry status and determine if retries should continue.

        Args:
            packet_id: Unique packet identifier
            current_error_message: Latest error from compiler/runtime
            attempt_number: Current attempt number (1-indexed)

        Returns:
            RetryAnalysis with recommendation
        """
        # Record this attempt
        self.record_attempt(packet_id, current_error_message, attempt_number)

        # Get error history for this packet
        history = self.packet_history.get(packet_id, [])
        current_category = self.classify_error(current_error_message)

        # Detect divergence
        divergence = self.detect_divergence(packet_id)

        # Determine if should continue
        should_continue = True
        recommendation = ""

        if attempt_number >= self.max_retries:
            should_continue = False
            recommendation = f"Retry budget exhausted ({self.max_retries} attempts). Escalate to Tier 2."

        elif divergence:
            should_continue = False
            recommendation = f"Divergent loop detected: {current_category.value} error repeating. Escalate to Tier 2."

        elif current_category == ErrorCategory.ENVIRONMENT:
            should_continue = False
            recommendation = f"Environment error (not fixable by code iteration). Escalate to Tier 2."

        else:
            recommendation = f"Error category: {current_category.value}. Retry {attempt_number + 1}/{self.max_retries}."

        return RetryAnalysis(
            packet_id=packet_id,
            should_continue=should_continue,
            error_category=current_category,
            attempt_count=attempt_number,
            error_history=history,
            divergence_detected=divergence,
            recommendation=recommendation
        )

    def get_packet_history(self, packet_id: str) -> List[Dict]:
        """Get full retry history for a packet."""
        if packet_id not in self.packet_history:
            return []

        return [asdict(sig) for sig in self.packet_history[packet_id]]


def test_convergence_monitor():
    """Basic test of convergence monitoring."""
    monitor = RetryConvergenceMonitor(max_retries=4)

    # Simulate a packet with divergent TypeScript errors
    packet_id = "test_packet_001"

    errors = [
        'TypeError: Cannot find module "react"',
        "TypeError: Property 'useState' does not exist",
        'TypeError: Cannot find module "react"',
        "TypeError: Property 'useState' does not exist",
    ]

    for attempt, error in enumerate(errors, 1):
        analysis = monitor.analyze_retry_status(packet_id, error, attempt)
        print(f"Attempt {attempt}: {analysis.error_category.value}")
        print(f"  → {analysis.recommendation}")
        print(f"  → Divergence: {analysis.divergence_detected}")
        print(f"  → Continue: {analysis.should_continue}\n")

    # Print final history
    history = monitor.get_packet_history(packet_id)
    print(f"Final history: {json.dumps(history, indent=2, default=str)}")


if __name__ == "__main__":
    test_convergence_monitor()
