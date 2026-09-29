---
name: structured-telemetry
description: Structured Logging & Telemetry Protocol — Asynchronous contextvars propagation, distributed correlation IDs, and JSON stream serialization
stratum: Observability & Diagnostics
tags: [telemetry, logging, structured-logging, trace-id, correlation-id, json, observability]
---

# Structured Logging & Telemetry Protocol

## 1. Core Doctrine
**Unstructured text logs are invisible to autonomous monitoring.**
String-concatenated logs (`print("user logged in: " + user)`) cannot be indexed, filtered, or correlated across asynchronous background daemons and child processes. Every log entry across Faust's sovereign daemons must be structured, typed, and tagged with a distributed correlation ID.

## 2. Distributed Context Propagation

```
  HTTP / C2 Directive Ingress (Telegram / CLI / API)
        │
        ▼  Generate or Extract: X-Correlation-ID & X-Trace-ID
  ┌────────────────────────────────────────────────────────┐
  │ contextvars: correlation_id, trace_id, stratum, actor   │
  └──────────────────────────┬────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [Async I/O Worker]                 [Subprocess / Daemon]
    Reads bound context                Injects HTTP / CLI headers
    Emits JSON line                    Emits JSON line
            │                                 │
            └────────────────┬────────────────┘
                             ▼
              Unified Telemetry Sink (.jsonl)
       {"timestamp": "...", "correlation_id": "...", ...}
```

## 3. Mandatory Implementation Pattern

### 1. Zero-Dependency Python Standard Library Implementation
```python
import json
import logging
import sys
import time
import uuid
from contextvars import ContextVar
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

# Async-safe context variables
ctx_correlation_id: ContextVar[str] = ContextVar("correlation_id", default="")
ctx_stratum: ContextVar[str] = ContextVar("stratum", default="core")


class JSONTelemetryFormatter(logging.Formatter):
    """Formats log records as atomic single-line JSON objects."""

    def format(self, record: logging.LogRecord) -> str:
        log_obj: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "correlation_id": ctx_correlation_id.get() or "root",
            "stratum": ctx_stratum.get(),
            "process_id": record.process,
            "thread_name": record.threadName,
        }

        # Inject extra attributes passed in logging calls
        if hasattr(record, "extra_data") and isinstance(record.extra_data, dict):
            log_obj["data"] = record.extra_data

        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_obj, ensure_ascii=False)


def setup_telemetry_logger(name: str, log_file: Optional[Path] = None) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    logger.propagate = False

    formatter = JSONTelemetryFormatter()

    # Stream Handler (stdout)
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)

    # File Handler
    if log_file:
        log_file.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(str(log_file), encoding="utf-8")
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return logger
```

### 2. Context Binding Context Manager
```python
from contextlib import contextmanager

@contextmanager
def bind_trace_context(correlation_id: Optional[str] = None, stratum: str = "core"):
    token_corr = ctx_correlation_id.set(correlation_id or str(uuid.uuid4()))
    token_strat = ctx_stratum.set(stratum)
    try:
        yield ctx_correlation_id.get()
    finally:
        ctx_correlation_id.reset(token_corr)
        ctx_stratum.reset(token_strat)
```

## 4. Architectural Rules for Faust Daemons
1. **Always Bind at Ingress**:
   - The moment a directive arrives (via Telegram polling, HTTP webhook, or CLI invocation), generate or capture `correlation_id` immediately.
2. **Propagate Across Subprocesses**:
   - When spawning Claude Code or child worker scripts, pass `FAUST_CORRELATION_ID` in environment variables or CLI flags.
3. **Atomic Single-Line Output**:
   - Output must be exactly one JSON object per line (`.jsonl`) to guarantee thread-safe non-interleaved streaming.
