---
name: secure-coding
description: Defensive Secure Coding Invariants — Zero-shell injection, path traversal elimination, secret isolation, and safe deserialization
stratum: Engineering Discipline
tags: [security, hardening, sanitization, defensive-security, invariants]
---

# Defensive Secure Coding Invariants

## 1. Core Doctrine
**Assume all external input is adversarial.**
Local daemons, webhooks, CLI arguments, and file parsers are entry points. Never rely on perimeter trust; validate, sanitize, and isolate at every boundary.

## 2. The 5 Defensive Invariants

```
  ┌────────────────────────────────────────────────────────┐
  │ 1. PARAMETERIZED PROCESS EXECUTION                     │
  │    Never use shell=True with user/dynamic strings      │
  └──────────────────────────┬────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. CANONICAL PATH TRAVERSAL GUARDS                     │
  │    Resolve realpath and enforce base directory prefix  │
  └──────────────────────────┬────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. CREDENTIAL ISOLATION & LOG REDACTION                │
  │    Zero secrets in git, mask tokens in log streams     │
  └──────────────────────────┬────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 4. SAFE DESERIALIZATION ONLY                           │
  │    JSON / Schema only; forbid pickle, eval, and yaml   │
  └──────────────────────────┬────────────────────────────┘
                             │
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 5. BOUNDED RESOURCE LIMITS                             │
  │    Timeouts on all subprocesses, sockets, and queries  │
  └────────────────────────────────────────────────────────┘
```

## 3. Mandatory Implementation Patterns

### 1. Zero Shell Injection
Always pass command and arguments as a discrete sequence:
```python
# SECURE: Direct executable invocation without shell interpreter
subprocess.run(["python", script_path, arg1, arg2], check=True, timeout=30)

# FORBIDDEN: Shell injection vulnerability
# subprocess.run(f"python {script_path} {arg1}", shell=True)
```

### 2. Path Traversal Elimination
When handling filenames or relative paths from external sources:
```python
from pathlib import Path

def resolve_safe_path(base_dir: Path, user_path: str) -> Path:
    target = (base_dir / user_path).resolve()
    if not target.is_relative_to(base_dir.resolve()):
        raise ValueError(f"Path traversal detected: {user_path}")
    return target
```

### 3. Secret Isolation & Redaction
- Never hardcode API tokens, passwords, or bot keys in source files or commit histories.
- Environment variables or `.env` files must be ignored in `.gitignore`.
- Error logs and telemetry dispatchers must scrub known credential patterns:
  ```python
  def redact_token(text: str) -> str:
      return re.sub(r'(bot\d+:[A-Za-z0-9_-]{20,})', r'[REDACTED_BOT_TOKEN]', text)
  ```

### 4. Safe Deserialization
- Never use `pickle.loads()`, `eval()`, or unsafe `yaml.load()` on untrusted data.
- Enforce standard `json.loads()` with schema validation (via Pydantic or dataclasses).

### 5. Mandatory Timeouts
Every network socket, HTTP call, and external process call must specify an explicit timeout (default: 5-30s). Infinite blocking is an architectural bug.
