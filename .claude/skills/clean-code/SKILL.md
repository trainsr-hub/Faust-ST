---
name: clean-code
description: Faust Anti-Spaghetti Architecture & Clean Code Protocol — Enforces 4-tier separation of concerns, strict modularity limits, guard clauses, immutability, and Karpathy simplicity principles across all codebases
---

# Faust Anti-Spaghetti Architecture & Clean Code Protocol

This skill provides non-negotiable coding standards, architectural guardrails, and refactoring guidelines to prevent code sprawl, monolithic files, untyped state mutations, and spaghetti logic.

---

## 1. The Core Anti-Spaghetti Tenets

### I. The 4-Tier Clean Layer Separation
Never mix presentation, business logic, and database operations in the same module. Every feature must respect four discrete layers:

```
┌────────────────────────────────────────────────────────┐
│  Tier 4: Transport / UI Layer                          │
│  (FastAPI Routers, CLI entrypoints, React Components)  │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│  Tier 3: Service Layer (Business Logic)                │
│  (Pure orchestration, validation, calculations)        │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│  Tier 2: Repository Layer (Data Access & Persistence)  │
│  (SQLite, file I/O, external network calls)            │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│  Tier 1: Domain Layer (Pure Data Schemas & Types)      │
│  (Pydantic models, Frozen Dataclasses, TS Types)       │
└────────────────────────────────────────────────────────┘
```

- **Rule 1.1**: The **Domain Layer** has ZERO external dependencies. It defines pure schemas, types, and invariants.
- **Rule 1.2**: The **Repository Layer** only executes storage and retrieval. It never implements business rules.
- **Rule 1.3**: The **Service Layer** orchestrates domain operations. It never imports database cursor objects, HTTP request objects, or UI elements.
- **Rule 1.4**: The **Transport / UI Layer** is skinny. It only handles input parsing, status codes, and presentation. If a route handler exceeds 40 lines, it is violating this boundary.

---

## 2. Hard Complexity Budgets & Modularity Limits

| Metric | Hard Ceiling | Action When Exceeded |
| :--- | :--- | :--- |
| **File Length** | **300 lines** (warn at 200) | Split into domain/service/repository submodules |
| **Function Length** | **40 lines** | Extract helper functions with single responsibilities |
| **Indentation Depth** | **3 levels max** | Use guard clauses (early returns) immediately |
| **Function Parameters** | **4 parameters max** | Group into a typed schema (Pydantic / dataclass / TS interface) |
| **Nesting of Conditionals** | **No nested ternaries** | Convert to explicit `if / elif / else` or lookup tables |

---

## 3. Structural Rules & Idioms

### A. Guard Clauses (Early Return) — Destroy Arrow Code
Never wrap the entire function body in nested `if` blocks. Check preconditions first, fail/return immediately, and keep the happy path unindented.

```python
# FAIL: Spaghetti Arrow Code (Deeply Nested)
def process_directive(directive: dict) -> bool:
    if directive.get("valid"):
        if directive.get("authorized"):
            if not directive.get("expired"):
                # 4 levels of indentation
                execute_task(directive)
                return True
            else:
                return False
        else:
            return False
    return False

# PASS: Faust Clean Guard Clause Pattern (Flat & Clear)
def process_directive(directive: DirectivePayload) -> bool:
    if not directive.valid:
        return False
    if not directive.authorized:
        return False
    if directive.expired:
        return False

    execute_task(directive)
    return True
```

### B. Strict Immutability & Type Annotations
- **Zero Untyped Dictionaries**: Do not pass arbitrary `dict` or `any` blobs across service boundaries. Define structured schemas using Pydantic or `dataclasses(frozen=True)` in Python, and explicit `interface` / `type` in TypeScript.
- **Return New State**: Never mutate input arguments or global state in-place.

```python
# FAIL: In-place mutation of input dictionaries
def update_user_status(payload: dict) -> dict:
    payload["status"] = "active"
    payload["updated_at"] = time.time()
    return payload

# PASS: Immutable transformation returning a new typed instance
@dataclass(frozen=True)
class UserStatus:
    user_id: str
    status: str
    updated_at: float

def activate_user(user: UserStatus) -> UserStatus:
    return replace(user, status="active", updated_at=time.time())
```

### C. Karpathy Simplicity Doctrine (YAGNI)
- **Minimum Code**: Write the simplest code that solves the problem. No speculative generality.
- **No Single-Use Abstractions**: Do not create abstract base classes, generic factory registries, or wrapper interfaces for code used in only one place.
- **No Speculative Config**: Do not add configuration flags, hooks, or parameters for features that were not requested.
- **200 vs 50 Rule**: If a solution can be implemented cleanly in 50 lines, never produce 200 lines. Senior engineers value clarity and maintainability over cleverness.

### D. Surgical Edits & Orphan Cleanup
- **Scoped Diff**: Every modified line must trace directly to the task. Never "reformat" or "touch up" unrelated code or comments.
- **Orphan Elimination**: When refactoring or deleting a function, immediately delete any unused imports, dead variables, or orphaned helper utilities created by that change.

---

## 4. Anti-Pattern Hall of Shame & Remedies

### Anti-Pattern 1: The God File
*Symptom*: A single file (`main.py`, `app.tsx`, `engine.py`) containing 800+ lines with DB queries, FastAPI routes, and helper logic all intertwined.  
*Remedy*: Apply the `surgical-refactor` skill. Break into:
- `models.py` (Domain types)
- `repository.py` (Persistence)
- `service.py` (Core logic)
- `router.py` (Transport/endpoints)

### Anti-Pattern 2: The Silent Error Swallower
*Symptom*: Catching generic `Exception` and passing silently or printing without re-raising:
```python
# FAIL
try:
    save_data(record)
except Exception:
    pass
```
*Remedy*: Catch specific exceptions, log actionable context, and either handle deterministically or fail loudly:
```python
# PASS
try:
    save_data(record)
except sqlite3.OperationalError as e:
    logger.error("Failed to commit record %s: %s", record.id, e)
    raise DatabaseStorageError(f"Persistence failure: {e}") from e
```

### Anti-Pattern 3: Magic Literals Everywhere
*Symptom*: Hardcoding numbers, string identifiers, and status strings in multiple places (`"status" == 2`, `timeout=120000`).  
*Remedy*: Extract to top-level constants or Enums (`STATUS_ACTIVE = "active"`, `DEFAULT_TIMEOUT_MS = 120_000`).

---

## 5. Verification Checklist Before Marking Work Complete

Before concluding any coding turn:
1. [ ] **File Size**: Are all touched files under 300 lines?
2. [ ] **Indentation**: Is nesting 3 levels or fewer? Guard clauses used?
3. [ ] **Type Hints**: Are all function signatures annotated with clear return types?
4. [ ] **Orphans**: Are all unused imports and dead variables cleaned up?
5. [ ] **Layering**: Did database logic remain out of the UI/Transport layer?
6. [ ] **Verification**: Did you run `py_compile`, `pytest`, or `tsc` with zero errors? (Enforced by `verification-before-completion`).
