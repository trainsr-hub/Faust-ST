---
name: circuit-breaker
description: Circuit Breaker & Resilience Protocol — Closed/Open/Half-Open state transitions, exponential backoff with jitter, and fallback cascades
stratum: Architecture & Resilience
tags: [resilience, circuit-breaker, fault-tolerance, backoff, retry, daemons]
---

# Circuit Breaker & Resilience Protocol

## 1. Core Doctrine
**An unisolated dependency failure will always cascade into a total system blackout.**
When a downstream microservice, background daemon, or external API (e.g. Telegram Bot API, remote LLMs, TTS endpoints) degrades or fails, repeated naive retries cause resource exhaustion, socket starvation, and thread deadlocks. Every external boundary must be protected by a strict stateful Circuit Breaker.

## 2. The 3-State Finite Machine

```
       ┌─────────────────────────────────────────────┐
       │                                             │
       │  Calls succeed                              │
       ▼                                             │
  ┌──────────┐       Failures >= Threshold       ┌──────────┐
  │  CLOSED  ├──────────────────────────────────►│   OPEN   │
  └──────────┘                                   └──────────┘
       ▲                                               │
       │               Trial call succeeds             │ Reset timeout
       │             ┌─────────────────────┐           │ elapsed
       │             │                     │           ▼
       │             │                ┌───────────────┐
       └─────────────┴────────────────┤   HALF-OPEN   │
                                      └───────────────┘
                                               │
                                               │ Trial call fails
                                               ▼
                                         (Back to OPEN)
```

1. **`CLOSED` (Normal Flow)**:
   - Requests execute directly against the remote service.
   - Consecutive failures increment an internal counter.
   - If failures meet or exceed `failure_threshold` within `sliding_window`, the circuit immediately trips to **`OPEN`**.
2. **`OPEN` (Short-Circuit Fast-Fail)**:
   - Zero outbound requests are sent; requests fail immediately or invoke deterministic local fallback routines.
   - Protects the downstream service from stampeding thundering herds and prevents caller thread exhaustion.
   - Remains in `OPEN` until `recovery_timeout` has elapsed.
3. **`HALF-OPEN` (Canary Probe)**:
   - After `recovery_timeout`, exactly one trial request is permitted to probe the downstream service.
   - If the canary succeeds: circuit resets to **`CLOSED`** and error counters are cleared.
   - If the canary fails: circuit immediately reverts to **`OPEN`** with an exponential backoff penalty.

## 3. Mandatory Implementation Pattern

```python
import functools
import threading
import time
from enum import Enum
from typing import Any, Callable, Optional, Tuple, Type


class CircuitState(Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"


class CircuitBreakerOpenException(Exception):
    """Raised when an operation is short-circuited while OPEN."""
    pass


class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: float = 30.0,
        expected_exceptions: Tuple[Type[Exception], ...] = (Exception,),
        fallback: Optional[Callable[..., Any]] = None,
        name: str = "default",
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exceptions = expected_exceptions
        self.fallback = fallback
        self.name = name

        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._last_state_change = time.monotonic()
        self._lock = threading.Lock()

    @property
    def state(self) -> CircuitState:
        with self._lock:
            if self._state == CircuitState.OPEN:
                if (time.monotonic() - self._last_state_change) >= self.recovery_timeout:
                    self._to_state(CircuitState.HALF_OPEN)
            return self._state

    def _to_state(self, new_state: CircuitState) -> None:
        self._state = new_state
        self._last_state_change = time.monotonic()
        if new_state == CircuitState.CLOSED:
            self._failure_count = 0

    def __call__(self, func: Callable[..., Any]) -> Callable[..., Any]:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            current_state = self.state

            if current_state == CircuitState.OPEN:
                if self.fallback:
                    return self.fallback(*args, **kwargs)
                raise CircuitBreakerOpenException(
                    f"Circuit '{self.name}' is OPEN. Fast-failing request."
                )

            try:
                result = func(*args, **kwargs)
            except self.expected_exceptions as exc:
                self._handle_failure()
                if self.fallback:
                    return self.fallback(*args, **kwargs)
                raise exc
            else:
                self._handle_success()
                return result

        return wrapper

    def _handle_success(self) -> None:
        with self._lock:
            if self._state == CircuitState.HALF_OPEN:
                self._to_state(CircuitState.CLOSED)
            elif self._state == CircuitState.CLOSED:
                self._failure_count = 0

    def _handle_failure(self) -> None:
        with self._lock:
            self._failure_count += 1
            if self._state == CircuitState.HALF_OPEN or self._failure_count >= self.failure_threshold:
                self._to_state(CircuitState.OPEN)
```

## 4. Architectural Rules for Faust Subsystems
1. **Never Wrap Retries Inside the Breaker**:
   - The circuit breaker must wrap around the retry logic, not inside it.
   - Retries handle transient TCP blips; circuit breakers prevent systemic outage avalanches.
2. **Deterministic Fallbacks**:
   - Every daemon or bridge that contacts external endpoints must supply a zero-LLM deterministic fallback (e.g., local disk queue, cached schema, or clean error envelope).
3. **Escalation Notification**:
   - When a critical circuit transitions to `OPEN`, emit an escalation telemetry packet to `logs/escalations/` and notify the Manager.
