---
name: rate-limiting
description: Rate Limiting & Traffic Shaping Protocol — Token-bucket and sliding-window rate limiters, burst control, and 429 backoff defense
stratum: Architecture & Traffic Management
tags: [rate-limiting, throttling, token-bucket, sliding-window, traffic-shaping, resilience, telegram]
---

# Rate Limiting & Traffic Shaping Protocol

## 1. Core Doctrine
**Unthrottled traffic generation will inevitably trigger remote API bans and cascading local starvation.**
Whether contacting external APIs (Telegram Bot API rate limits: 1 msg/sec per chat, 30 msgs/sec global; LLM endpoints with RPM/TPM ceilings) or serving local C2 endpoints, unmetered bursts lead to HTTP 429 `Too Many Requests`, transient TCP drops, and connection reset penalties.

Every boundary across Faust's egress clients and ingress servers must enforce deterministic rate limiting.

## 2. Token Bucket Algorithm Model

```
       Tokens Added at Rate R (Tokens/Second)
                        │
                        ▼
               ┌─────────────────┐
               │  TOKEN BUCKET   │
               │ Capacity: C     │
               │ Current: N      │
               └────────┬────────┘
                        │
       Request Arrives  │  Check: Is N >= Cost?
                        ▼
             ┌─────────────────────┐
       YES   │ Decrement Tokens:   │   NO
      ┌──────┤ N = N - Cost        ├──────┐
      │      └─────────────────────┘      │
      ▼                                   ▼
 [Allow Execution]               [Throttle / Delay / 429]
                                 - Non-blocking: Reject 429
                                 - Blocking: Sleep until token available
```

1. **Capacity ($C$)**: Maximum burst size allowed at any instant.
2. **Refill Rate ($R$)**: Continuous token replenishment rate per second.
3. **Dual Execution Modes**:
   - **Non-blocking (Drop / Fast-Reject)**: If insufficient tokens, immediately return `HTTP 429 Too Many Requests` with a calculated `Retry-After` header.
   - **Blocking (Paced Traffic Shaping)**: If insufficient tokens, compute the exact fractional sleep duration and delay execution smoothly without dropping payloads.

## 3. Mandatory Implementation Pattern

### Thread-Safe Token Bucket & Sliding Window Limiter (Zero Third-Party Dependencies)

```python
import functools
import threading
import time
from typing import Any, Callable, Dict, Optional, Tuple


class RateLimitExceeded(Exception):
    """Raised when non-blocking rate limit is exceeded."""
    def __init__(self, retry_after: float):
        super().__init__(f"Rate limit exceeded. Retry after {retry_after:.2f}s.")
        self.retry_after = retry_after


class TokenBucket:
    """
    High-precision, thread-safe Token Bucket rate limiter.
    Supports both pacing (blocking delay) and fast-reject (non-blocking).
    """

    def __init__(self, rate: float, capacity: float, initial: Optional[float] = None):
        """
        Args:
            rate: Tokens added per second.
            capacity: Maximum burst capacity of the bucket.
            initial: Initial token balance (defaults to capacity).
        """
        self.rate = float(rate)
        self.capacity = float(capacity)
        self.tokens = float(capacity if initial is None else initial)
        self.last_update = time.monotonic()
        self._lock = threading.Lock()

    def _replenish(self) -> None:
        now = time.monotonic()
        elapsed = now - self.last_update
        self.last_update = now
        self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)

    def acquire(self, tokens: float = 1.0, block: bool = True, timeout: Optional[float] = None) -> bool:
        """
        Acquire tokens from the bucket.
        If block is True, sleeps until tokens become available.
        If block is False, returns False immediately if tokens are insufficient.
        """
        start_time = time.monotonic()

        while True:
            with self._lock:
                self._replenish()

                if self.tokens >= tokens:
                    self.tokens -= tokens
                    return True

                if not block:
                    return False

                # Calculate required sleep duration
                missing = tokens - self.tokens
                sleep_duration = missing / self.rate

                if timeout is not None:
                    already_waited = time.monotonic() - start_time
                    if already_waited + sleep_duration > timeout:
                        return False

            time.sleep(sleep_duration)

    def get_retry_after(self, tokens: float = 1.0) -> float:
        """Returns seconds until requested tokens are available."""
        with self._lock:
            self._replenish()
            if self.tokens >= tokens:
                return 0.0
            return (tokens - self.tokens) / self.rate


class RateLimiterRegistry:
    """Manages scoped token buckets by key (e.g. per-chat or per-endpoint)."""

    def __init__(self, default_rate: float = 1.0, default_capacity: float = 5.0):
        self.default_rate = default_rate
        self.default_capacity = default_capacity
        self.buckets: Dict[str, TokenBucket] = {}
        self._lock = threading.Lock()

    def get_bucket(self, key: str) -> TokenBucket:
        with self._lock:
            if key not in self.buckets:
                self.buckets[key] = TokenBucket(self.default_rate, self.default_capacity)
            return self.buckets[key]


def rate_limited(bucket: TokenBucket, block: bool = True):
    """Decorator to enforce rate limiting on critical callables."""
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            if not bucket.acquire(tokens=1.0, block=block):
                retry_after = bucket.get_retry_after(tokens=1.0)
                raise RateLimitExceeded(retry_after)
            return func(*args, **kwargs)
        return wrapper
    return decorator
```

## 4. Architectural Rules for Faust Subsystems
1. **Telegram Egress Protection**:
   - Outbound Telegram notifications must pass through a `TokenBucket(rate=1.0, capacity=3.0)` to strictly prevent Telegram HTTP 429 penalties during rapid burst notifications.
2. **Deterministic Pacing Over Dropping**:
   - High-priority C2 operational debriefs and error alerts must use blocking pacing (`block=True`) rather than dropping messages.
3. **Respect Upstream `Retry-After`**:
   - Whenever an external service returns HTTP 429, parse the `Retry-After` header immediately and freeze the corresponding bucket until the duration has elapsed.
4. **Zero Shared Polling Tokens**:
   - Ingress polling loops must never compete with outbound dispatchers for rate limit allocations.
