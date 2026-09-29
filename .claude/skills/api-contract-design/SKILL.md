---
name: api-contract-design
description: Schema-First API Contract Design — Enforce immutable, strongly-typed boundaries and deterministic validation across frontend and backend
stratum: Architecture & Quality
tags: [api, contract, schema, validation, pydantic, zod, quality]
---

# Schema-First API Contract Design Protocol

## 1. Core Doctrine
**Never write route handlers or UI consumers without a finalized, strongly-typed schema.**
Unchecked boundary data causes phantom runtime exceptions, data corruption, and tight coupling between client and server. All inputs and outputs must pass through strict, deterministic validation barriers at the boundary.

## 2. The 4-Tier Boundary Separation

```
  [External Client / Telegram / UI]
                 │
                 ▼
  ┌────────────────────────────────────────────────────────┐
  │ 1. INGRESS SCHEMA (Request DTO)                        │
  │    - Validates types, regex, ranges, and nullability   │
  │    - Strips unauthorized / unknown parameters          │
  └──────────────────────────┬────────────────────────────┘
                             │ (Validated Data)
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. DOMAIN LOGIC / SERVICE LAYER                        │
  │    - Pure business operations & ACID transactions      │
  │    - Operates on immutable internal entities           │
  └──────────────────────────┬────────────────────────────┘
                             │ (Internal State)
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. EGRESS SCHEMA (Response DTO)                        │
  │    - Sanitizes internal state, strips credentials      │
  │    - Guarantees deterministic serialization format     │
  └──────────────────────────┬────────────────────────────┘
                             │
                             ▼
  [Client Receives Immutable, Structured Payload]
```

## 3. Mandatory Invariants

1. **Schema-First Primacy**:
   - Write the Pydantic (Python) or Zod/TypeScript (Frontend) model before implementing the handler or UI component.
   - Internal database models must **never** be directly exposed over HTTP, IPC, or WebSocket endpoints.

2. **Deterministic Error Envelope**:
   All endpoints must return a standardized error envelope on failure (`HTTP 4xx / 5xx`):
   ```json
   {
     "error": {
       "code": "VALIDATION_FAILED",
       "message": "Field 'user_id' must be a positive integer.",
       "details": [
         { "field": "user_id", "issue": "greater_than_zero" }
       ]
     }
   }
   ```
   Never leak raw stack traces, database query strings, or internal file paths to API callers.

3. **Additive-Only Compatibility**:
   - Existing schema fields must never be deleted or renamed in an active contract version.
   - New fields added to request schemas must be optional or have safe defaults to preserve backward compatibility.
   - Breaking changes require explicit API path incrementation (`/v1/` to `/v2/`).

4. **Zero-LLM Validation Enforcement**:
   - Use deterministic, compile-time/runtime validators (Pydantic V2, Zod, TypeBox, or FastAPI dependencies) for 100% of schema checks.
   - LLMs must only process structured payloads validated upstream by schema engines.

5. **Anti-Spaghetti Limits**:
   - Schema files must not exceed 300 lines.
   - Schemas are pure data structures: no database queries, I/O calls, or business logic inside schema validators.
