---
name: verification-before-completion
description: Faust Verification Protocol — The Iron Law: No completion claims, PRs, or success assertions without fresh verification command evidence from the terminal
---

# Verification Before Completion Protocol

**Core Principle**: Evidence before claims, always.  
**Violating the letter of this rule is violating the spirit of this rule.**

---

## 1. The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you have not run the verification command in the current turn and inspected the actual terminal output, you are strictly prohibited from claiming the code works, is fixed, or passes.

---

## 2. The 5-Step Verification Gate

Before claiming any milestone is complete, fixed, or operational:

```
┌────────────────────────────────────────────────────────┐
│ 1. IDENTIFY : What exact CLI command proves this work? │
│ 2. EXECUTE  : Run the full, fresh command in terminal  │
│ 3. INSPECT  : Read exit code, stderr, and stdout       │
│ 4. CONFIRM  : Does the output prove 0 errors/failures? │
│ 5. ASSERT   : State the outcome WITH the exact output  │
└────────────────────────────────────────────────────────┘
```

*Note: Skipping any step or declaring success without running the command constitutes a critical hallucination failure.*

---

## 3. Standard Verification Commands by Stack

| Stack / Subsystem | Primary Verification Command | Required Evidence |
| :--- | :--- | :--- |
| **Python Syntax & Imports** | `python -m py_compile <path_to_file>` | Zero errors, exit code 0 |
| **Python Unit & Logic** | `pytest <path_to_test> -v` | All tests green, 0 failures |
| **TypeScript / Web-OS** | `npx tsc --noEmit` | Clean compile, 0 diagnostics |
| **Frontend Build** | `npm run build` or `vite build` | Exit code 0, bundle emitted |
| **SQLite Database** | `python -c "import sqlite3; ... PRAGMA integrity_check;"` | Returns `"ok"` |
| **Resident Daemons** | `curl -s http://127.0.0.1:<port>/health` | Status 200, `"status": "ok"` |

---

## 4. Red Flag Phrases (Strictly Prohibited)

Never use speculative language when reporting outcomes:
- ❌ *"This should work now."*
- ❌ *"It looks correct."*
- ❌ *"It probably passes."*
- ❌ *"I believe the issue is resolved."*
- ❌ *"Tests should pass once executed."*
- ❌ *"Everything seems fine."*

Instead, use factual statements paired with evidence:
- ✅ *"Executed `python -m py_compile engine.py` -> Clean compilation with exit code 0."*
- ✅ *"Executed `pytest tests/test_engine.py` -> 12 passed in 0.42s."*
- ✅ *"Tested daemon endpoint via PowerShell -> Response HTTP 200 `{'status': 'ok'}`."*

---

## 5. Subagent & Machinist Verification Rule

When delegating code fabrication to Tier 3 Machinists (`faust-machinist-logic` or `faust-machinist-ui`):
1. **Never trust agent self-declarations**: An agent stating *"I have completed the task"* is NOT verification.
2. **Independent Check**: Inspect the git diff and execute the verification command independently before presenting the result to the Manager.
