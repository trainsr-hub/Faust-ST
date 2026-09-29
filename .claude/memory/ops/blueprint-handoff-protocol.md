---
name: blueprint-handoff-protocol
description: File-based blueprint handoff mechanism between Faust-ND planners and Faust-TH tactical workers
metadata:
  type: project
---

# Blueprint Handoff Protocol: Faust-ND → Faust-TH

## Overview

The blueprint handoff protocol establishes a deterministic, file-based mechanism for Faust-ND (strategic planners) to communicate atomic work tasks to Faust-TH (tactical executors).

**Key Principle**: If Faust-ND plans correctly, the blueprint it produces is already chunked into atomic, parallelizable micro-tasks. No separate dispatch layer (Faust-RD) needed.

## Architecture

```
Faust-ND (Strategic Architect)
    ↓ produces
Blueprint JSON (persisted to TEMP folder)
    ↓ read by
Faust-TH Workers (Tactical Executors)
    ↓ report back
Execution Results (success/failure/diagnostics)
```

## Blueprint Handoff Workflow

### Phase 1: Blueprint Generation (Faust-ND)

**Faust-ND responsibility:**
1. Analyze task requirements and decompose into atomic modules
2. Define explicit dependencies between modules
3. Ensure each module is self-contained and achievable by a single worker
4. Generate structured blueprint JSON with all metadata

**Output format:**
```json
{
  "system_name": "descriptive_system_identifier",
  "version": "1.0.0",
  "timestamp": "2026-09-18T12:36:43Z",
  "module_count": <integer>,
  "modules": [
    {
      "id": "module_001_description",
      "target_file": "src/path/to/file.ts",
      "division": "ui|logic|backend|data|system",
      "dependencies": ["module_id_if_any"],
      "implementation_spec": "Detailed implementation instructions for this specific module",
      "contracts": {
        "input_schema": "What inputs this module expects",
        "output_schema": "What output this module produces",
        "validation": "How to validate success"
      },
      "constraints": ["constraint_1", "constraint_2"],
      "validation_command": "npm run test -- test_file.ts",
      "retry_budget": 4,
      "estimated_complexity": "small|medium|large"
    }
  ],
  "cross_module_contracts": {
    "shared_types": ["types.ts", "shared_schemas.py"],
    "api_contracts": ["expected REST endpoints"],
    "database_schema": "expected SQLite tables/columns"
  }
}
```

**Faust-ND persists blueprint to:**
```
d:\My Drive\Blue AI\.claude\temp\blueprints\
  ├── blueprint_<timestamp>_<system_name>.json
  └── blueprint_metadata_<timestamp>.txt
```

**Faust-ND outputs:** File path to blueprint JSON

### Phase 2: Blueprint Ingestion (Faust-TH)

**Faust-TH initialization:**
1. Receive blueprint file path from Faust-ND
2. Read and parse blueprint JSON
3. Validate module count matches declared count
4. Extract task-specific module for this worker
5. Execute the implementation_spec
6. Run validation_command
7. Report results

**Blueprint reading pattern (pseudo-code for Faust-TH):**
```python
with open(blueprint_path) as f:
    blueprint = json.load(f)

# Validate structure
assert blueprint['module_count'] == len(blueprint['modules'])

# Extract specific module for this worker
my_module = blueprint['modules'][module_index]

# Implement according to spec
implementation_result = execute_implementation(my_module['implementation_spec'])

# Validate
validation_result = run_command(my_module['validation_command'])

# Report back
return {
  'module_id': my_module['id'],
  'status': 'success|failed',
  'diagnostics': validation_result,
  'execution_time_ms': elapsed_ms
}
```

### Phase 3: Parallelism

**Execution waves** (defined by Faust-ND in blueprint):
```json
"execution_waves": [
  {
    "wave_id": 1,
    "parallelizable": true,
    "modules": ["module_001", "module_002"]
  },
  {
    "wave_id": 2,
    "parallelizable": true,
    "modules": ["module_003", "module_004"]
  }
]
```

- **Wave 1**: Modules 001, 002 run in parallel
- **Wave 2**: Modules 003, 004 run in parallel (after Wave 1 completes)
- Faust-ND ensures dependency edges don't cross wave boundaries

**Result**: Natural parallelism without a separate dispatcher layer.

### Phase 4: Error Escalation

**If Faust-TH worker exhausts retry budget (4 attempts):**

1. Worker generates escalation bundle:
```json
{
  "module_id": "module_xyz",
  "original_spec": "<full implementation_spec>",
  "attempts": [
    {
      "attempt_number": 1,
      "error": "TypeError: Cannot find module...",
      "error_category": "import"
    },
    ...
  ],
  "final_status": "escalated_to_tier_2",
  "recommendation": "Environment error (missing dependency). Faust-ND should revise blueprint."
}
```

2. Worker surfaces escalation bundle to Faust-ND
3. Faust-ND analyzes and either:
   - Revises blueprint (environmental fix needed)
   - Produces new implementation_spec (tactical approach was wrong)
   - Returns corrected module back to Faust-TH

## Directory Structure

```
d:\My Drive\Blue AI\.claude\temp\
├── blueprints/
│   ├── blueprint_2026-09-18T12-36_faust_workflow_deploy.json
│   ├── blueprint_2026-09-18T13-45_ui_component_system.json
│   └── blueprint_metadata_2026-09-18T12-36.txt
├── execution_results/
│   ├── result_2026-09-18T12-36_module_001.json
│   ├── result_2026-09-18T12-36_module_002.json
│   └── ...
└── escalations/
    ├── escalation_2026-09-18T12-36_module_xyz.json
    └── ...
```

**Lifecycle:**
- Blueprints persist for 30 days (auditability)
- Results persist indefinitely (history)
- Escalations trigger immediate Faust-ND re-planning

## Faust-ND Blueprint Quality Checklist

Before persisting blueprint, Faust-ND must verify:

- [ ] `module_count` matches `len(modules)`
- [ ] Each module has unique `id`
- [ ] Each module `target_file` is specified
- [ ] Each module `implementation_spec` is concrete and specific (not vague)
- [ ] `constraints` are actionable (not "make it good")
- [ ] `validation_command` is runnable and deterministic
- [ ] Dependencies form a DAG (no circular dependencies)
- [ ] `execution_waves` respect dependency boundaries
- [ ] `cross_module_contracts` are explicit
- [ ] Module complexity estimate is realistic (< 5 hour labor equivalent)

## Faust-TH Worker Obligations

1. **Read blueprint completely** before starting
2. **Execute ONLY the assigned module** (don't rewrite others)
3. **Follow implementation_spec exactly** (don't improvise)
4. **Run validation_command** after implementation
5. **Report diagnostics fully** on failure
6. **Escalate on retry exhaustion** (don't give up silently)
7. **Maintain shared resource contracts** (don't break types.ts for other modules)

## Benefits vs. Faust-RD Approach

| Aspect | Faust-RD (Unstable) | Blueprint Handoff (Stable) |
|--------|------------------|--------------------------|
| **Complexity** | High (DAG resolver, file locking) | Low (JSON handoff) |
| **Stability** | Multiple blocking issues | Proven file I/O pattern |
| **Latency** | Dispatcher overhead | Direct worker invocation |
| **Auditability** | Dispatcher logs + execution logs | Blueprint + results both persisted |
| **Debugging** | Trace through dispatcher logic | Read blueprint, compare to results |

## Related Memory

- [[core:autonomous-memory-and-execution]] — Worker autonomy and task execution
- [[core:multi_device_sync]] — Persistent state across Google Drive
- [[div:backend:real_time_interrupt_architecture]] — Escalation and course-correction patterns
