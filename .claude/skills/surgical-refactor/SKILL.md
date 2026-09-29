---
name: surgical-refactor
description: Faust Surgical Refactoring Protocol — Step-by-step methodology to safely decompose god files, untangle spaghetti code, and extract clean 4-tier modules without regressions
---

# Faust Surgical Refactoring Protocol

Use this skill when refactoring existing code, untangling large files (>300 lines), or breaking god objects into clean 4-tier modules.

---

## 1. The Golden Rule of Refactoring

```
NEVER CHANGE BEHAVIOR WHILE CHANGING STRUCTURE
```

Refactoring and feature additions must NEVER occur in the same git commit or turn. Refactor first to make the change easy, verify zero regression, then apply the new feature.

---

## 2. The 6-Phase Surgical Deconstruction Sequence

When dismantling a monolithic file (e.g., a 600-line `manager.py` or `App.tsx`):

### Phase 1: Baseline Characterization
1. Identify all public functions, classes, or endpoints exposed by the monolith.
2. Run the existing test suite or write a characterization smoke test to record existing behavior.
3. Verify baseline passes: `pytest` or `python -m py_compile`.

### Phase 2: Extract Leaf Types (Tier 1: Domain)
1. Scan the monolith for data structures, enums, typed dictionaries, or state representations.
2. Extract these into a standalone `models.py` or `types.ts`.
3. Ensure this file has **zero internal dependencies** on the rest of the application.
4. Update the monolith to import from the new types file. Verify clean compile.

### Phase 3: Extract Storage & I/O (Tier 2: Repository)
1. Find all raw SQL queries, file read/writes, or external API fetches.
2. Move them into a dedicated `repository.py` or `client.py`.
3. Keep methods atomic: `find_by_id()`, `save()`, `delete()`, `list_active()`.
4. Replace raw I/O blocks in the monolith with repository method calls. Verify clean compile.

### Phase 4: Encapsulate Business Logic (Tier 3: Service)
1. Extract business computations, multi-step workflows, and data transformations into `service.py`.
2. Ensure the service operates on Domain models and accepts Repositories via dependency injection or clean instantiation.
3. Keep functions under 40 lines; enforce guard clauses.

### Phase 5: Slim the Transport / UI Layer (Tier 4)
1. The original monolith now becomes a slim router, CLI wrapper, or pure React presentation component (<100 lines).
2. It simply accepts requests/props, delegates to the Service layer, and returns the result.

### Phase 6: Orphan Sweep & Verification
1. Remove all unused imports, dead variables, and obsolete comments.
2. Run the characterization test suite from Phase 1.
3. Confirm zero functional regressions via `verification-before-completion`.

---

## 3. Safe Refactoring Checklist

- [ ] Characterization smoke test executed before editing.
- [ ] Changes made incrementally (one tier extracted per step).
- [ ] No behavioral or feature changes introduced during extraction.
- [ ] All newly created files are under 300 lines.
- [ ] All functions have explicit type annotations.
- [ ] Unused imports and dead code purged.
- [ ] Verification command executed and passed with exit code 0.
