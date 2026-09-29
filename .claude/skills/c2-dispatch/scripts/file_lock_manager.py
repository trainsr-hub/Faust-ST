#!/usr/bin/env python3
"""
Faust File Lock Manager (Critical #2)
Single-writer locks for shared resource serialization across Tier 3 workers.
Prevents concurrent writes to types.ts, shared schemas, and other contract files.
"""

import fcntl
import os
import sys
import time
from contextlib import contextmanager
from pathlib import Path
from typing import Optional

# Shared files that require single-writer locks
SHARED_FILES = [
    # TypeScript shared contracts
    "src/types.ts",
    "src/shared/types.ts",
    "frontend/src/types.ts",
    
    # Python shared schemas
    "backend/models/schemas.py",
    "backend/api/schemas.py",
    "backend/shared/schemas.py",
    
    # Configuration files
    "faust_config.json",
    ".claude/faust_config.json",
    
    # Shared contracts that multiple modules write to
    ".claude/agents/schemas/machinist_task_manifest.py",
    ".claude/skills/c2-dispatch/config/architecture_invariants.json",
]


class FileLockError(Exception):
    """File lock acquisition failure."""
    pass


class FileLockManager:
    """Manages advisory file locks for shared resource serialization."""
    
    def __init__(self, lock_dir: Optional[Path] = None):
        self.lock_dir = lock_dir or Path(".claude/c2-dispatch/locks")
        self.lock_dir.mkdir(parents=True, exist_ok=True)
        self.acquired_locks = set()
        
    def _get_lock_path(self, target_file: str) -> Path:
        """Convert file path to lock file path."""
        # Normalize path for lock naming
        normalized = target_file.replace("/", "_").replace("\\", "_").replace(":", "_")
        return self.lock_dir / f"{normalized}.lock"
    
    def requires_lock(self, target_file: str) -> bool:
        """Check if a file requires single-writer locking."""
        for shared_pattern in SHARED_FILES:
            if target_file == shared_pattern or target_file.endswith(shared_pattern):
                return True
        return False
    
    @contextmanager
    def lock(self, target_file: str, timeout_seconds: int = 60):
        """
        Acquire a single-writer lock for the target file.
        Context manager that yields control while lock is held.
        
        Args:
            target_file: Path to file requiring lock
            timeout_seconds: Maximum wait time for lock acquisition
            
        Raises:
            FileLockError: If lock cannot be acquired within timeout
        """
        if not self.requires_lock(target_file):
            # No lock required for this file
            yield
            return
        
        lock_path = self._get_lock_path(target_file)
        lock_acquired = False
        start_time = time.time()
        
        try:
            # Try to acquire lock with timeout
            while not lock_acquired:
                try:
                    # Create lock file if it doesn't exist
                    lock_path.touch(exist_ok=True)
                    
                    # Open file for advisory locking
                    lock_fd = os.open(lock_path, os.O_RDWR)
                    
                    # Try to acquire exclusive lock (non-blocking)
                    try:
                        fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                        lock_acquired = True
                        self.acquired_locks.add(str(lock_path))
                        
                        # Yield control while lock is held
                        yield
                        
                    except BlockingIOError:
                        # Lock is held by another process
                        os.close(lock_fd)
                        
                        # Check timeout
                        if time.time() - start_time > timeout_seconds:
                            raise FileLockError(
                                f"Failed to acquire lock for {target_file} within {timeout_seconds}s"
                            )
                        
                        # Wait before retry (exponential backoff)
                        wait_time = min(1.0, time.time() - start_time) * 2
                        time.sleep(wait_time)
                        
                except Exception as e:
                    if lock_fd:
                        os.close(lock_fd)
                    raise FileLockError(f"Lock acquisition failed: {e}")
                    
        finally:
            # Release lock
            if lock_acquired and lock_fd:
                try:
                    fcntl.flock(lock_fd, fcntl.LOCK_UN)
                    os.close(lock_fd)
                    self.acquired_locks.discard(str(lock_path))
                except Exception:
                    pass
    
    def verify_no_collisions(self, work_packets):
        """
        Pre-validate that no two packets require locks on the same file.
        Called by dispatcher before DAG resolution.
        
        Args:
            work_packets: List of AtomicWorkPacket objects
            
        Returns:
            tuple: (collisions_found, collision_report)
        """
        lock_requirements = {}
        collisions = []
        
        for packet in work_packets:
            if self.requires_lock(packet.target_file):
                if packet.target_file in lock_requirements:
                    collisions.append({
                        "file": packet.target_file,
                        "packet_1": lock_requirements[packet.target_file],
                        "packet_2": packet.packet_id
                    })
                else:
                    lock_requirements[packet.target_file] = packet.packet_id
        
        return len(collisions) == 0, collisions
    
    def cleanup(self):
        """Clean up any orphaned lock files."""
        try:
            for lock_file in self.lock_dir.glob("*.lock"):
                try:
                    # Try to acquire and immediately release
                    with open(lock_file, "r") as f:
                        fcntl.flock(f, fcntl.LOCK_EX | fcntl.LOCK_NB)
                        fcntl.flock(f, fcntl.LOCK_UN)
                    # If successful, lock was orphaned - remove it
                    lock_file.unlink()
                except (BlockingIOError, PermissionError):
                    # Lock is actively held or permission denied - leave it
                    pass
        except Exception:
            # Don't crash on cleanup failures
            pass


# Cross-platform fallback for Windows (no fcntl)
if sys.platform == "win32":
    import msvcrt
    
    @contextmanager
    def windows_lock(self, target_file: str, timeout_seconds: int = 60):
        """Windows implementation using msvcrt.locking."""
        lock_path = self._get_lock_path(target_file)
        lock_acquired = False
        start_time = time.time()
        
        try:
            while not lock_acquired:
                try:
                    lock_path.touch(exist_ok=True)
                    lock_fd = os.open(lock_path, os.O_RDWR | os.O_CREAT)
                    
                    # Try to lock first 1 byte of file
                    try:
                        msvcrt.locking(lock_fd, msvcrt.LK_LOCK, 1)
                        lock_acquired = True
                        self.acquired_locks.add(str(lock_path))
                        yield
                        
                    except IOError:
                        os.close(lock_fd)
                        
                        if time.time() - start_time > timeout_seconds:
                            raise FileLockError(
                                f"Windows lock timeout for {target_file}"
                            )
                        
                        time.sleep(0.1)
                        
                except Exception as e:
                    if lock_fd:
                        os.close(lock_fd)
                    raise FileLockError(f"Windows lock failed: {e}")
                    
        finally:
            if lock_acquired and lock_fd:
                try:
                    msvcrt.locking(lock_fd, msvcrt.LK_UNLCK, 1)
                    os.close(lock_fd)
                    self.acquired_locks.discard(str(lock_path))
                except Exception:
                    pass
    
    # Override lock method for Windows
    FileLockManager.lock = windows_lock


def test_file_locking():
    """Basic test of file locking functionality."""
    manager = FileLockManager()
    
    test_file = "src/types.ts"
    
    # Test lock acquisition
    try:
        with manager.lock(test_file, timeout_seconds=2):
            print(f"✓ Lock acquired for {test_file}")
            
        # Test collision detection
        from dataclasses import dataclass
        
        @dataclass
        class MockPacket:
            packet_id: str
            target_file: str
        
        packets = [
            MockPacket("p1", "src/types.ts"),
            MockPacket("p2", "src/types.ts"),  # Collision
            MockPacket("p3", "backend/models.py"),  # No lock needed
        ]
        
        ok, collisions = manager.verify_no_collisions(packets)
        if not ok:
            print(f"✓ Collision detection working: {collisions}")
        else:
            print("✗ Collision detection failed")
            
    except FileLockError as e:
        print(f"✗ Lock test failed: {e}")
    
    manager.cleanup()


if __name__ == "__main__":
    test_file_locking()
