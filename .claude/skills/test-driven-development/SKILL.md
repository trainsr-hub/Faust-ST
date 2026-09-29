---
name: test-driven-development
description: Test-Driven Development (TDD) invariant — Write failing unit tests before implementing production code
stratum: Architecture & Quality
tags: [testing, quality, discipline, tdd]
---

# Test-Driven Development (TDD) Protocol

## 1. Core Doctrine
**Never write production logic without a failing test first.**
Code written without tests accumulates invisible assumptions, regression vulnerability, and tight coupling. TDD forces modularity, deterministic contracts, and crystal-clear input/output boundaries.

## 2. The Red-Green-Refactor Cycle

```
  ┌────────────────────────────────────────────────────────┐
  │ 1. RED: Write a minimal failing test for the next unit │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. VERIFY RED: Run test runner; confirm specific fail  │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. GREEN: Write simplest production code to pass test  │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 4. VERIFY GREEN: Run test runner; confirm test passes  │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 5. REFACTOR: Clean code (anti-spaghetti, 40-line limit)│
  └────────────────────────────────────────────────────────┘
```

## 3. Mandatory Invariants
1. **Zero Production Code Without Red Test**: If you are adding a feature or fixing a bug, produce the test assertion first.
2. **One Assertion Concept Per Test**: Tests must test a single behavior, failing for exactly one clear reason.
3. **Deterministic & Isolated**: Unit tests must not depend on external live networks or shared mutable disk states without mocks/fixtures.
4. **Execution Verification (The Iron Law)**: Run the test command in the terminal (`pytest`, `npm test`, `npx vitest run`) and verify exit code 0 before marking the task complete.
