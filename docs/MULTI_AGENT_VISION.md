# Architectural Vision: Hierarchical Multi-Agent System (Updated Framework)

## 1. Core Philosophy
The core principle of this architecture is **task atomization** combined with **deterministic infrastructural routing**. Complex engineering tasks are broken down into isolated "elementary particles" (atomic tasks). This allows the system to utilize hyper-fast, cost-effective open-source models for bulk programming execution, while reserving high-context premium reasoning models exclusively for high-level system design and architectural validation.

The system natively supports both **Autonomous Mode** and **Human-in-the-Loop (HITL) Mode** via simple state-switching gates.

---

## 2. The 4-Layer Multi-Agent Hierarchy & Routing Strategy
To decouple planning from task management and maximize token throughput, each specialized tier is allocated a **single, specific load-balancing routing strategy**.

```
┌───────────────┬──────────────┬───────────────────────────────┬────────────────────────┬──────────────────────────────────────────┐
│ Tier          │ Combo ID     │ Underlying Models             │ Routing Strategy       │ Operational Responsibility               │
├───────────────┼──────────────┼───────────────────────────────┼────────────────────────┼──────────────────────────────────────────┤
│ Tier 1        │ Faust-ST     │ Gemini 3.7 Flash (Tiered)     │ Intelligent Auto       │ User Interface, intent parsing, HITL     │
│ Tier 2        │ Faust-ND     │ Sonnet 4.6 (Think) + Flash-Hi │ Priority Queue         │ Strategic Blueprint, Schema & Review     │
│ Tier 2.5      │ Faust-RD     │ Deterministic Script (0-LLM)  │ Deterministic Pipeline │ DAG shredding, SHA Checksum, Dispatch    │
│ Tier 3        │ Faust-TH     │ Qwen3 32B + Llama 3.3 70B     │ Reset-Aware RR         │ Tactical Fabrication & Compiler Loops    │
└───────────────┴──────────────┴───────────────────────────────┴────────────────────────┴──────────────────────────────────────────┘
```

### Tier 1: User Interface & Context Router // Combo: Faust-ST
* **Primary Model:** `Gemini 3.7 Flash (Tiered)`
* **Assigned Routing Strategy:** `Intelligent Auto`
* **Technical Mechanism:** Operates as a self-healing smart routing pool driven by multi-factor scoring. It continuously monitors API latency, error rates, and remaining quotas. 
* **Responsibility:** Act as the user-facing interface. The `Tiered` configuration allows it to dynamically scale reasoning up or down based on request complexity, ensuring optimal intent parsing while maintaining low conversational latency.

### Tier 2: Deep Systems Engineer (Lead Architect & Reviewer) // Combo: Faust-ND
* **Primary Models:** `Claude Sonnet 4.6 (Thinking)` (Architect) + `Gemini 3.7 Flash (High)` (Reviewer)
* **Assigned Routing Strategy:** `Priority`
* **Technical Mechanism:** Enforces a strict priority queue. The system prioritizes all bandwidth, execution priority, and premium API quotas for this tier, ensuring structural planning requests are never choked by lower-tier operations.
* **Responsibility:** Consume requirements from Tier 1, map directory structures, write strict code interfaces (`types.ts`), and output a rigid, clean System Blueprint document. Skip expensive `Opus 4.6` in favor of `Sonnet 4.6 Thinking` for superior cost-to-performance execution.

### Tier 2.5: Programmatic Logistics Layer (The Dispatcher) // Combo: Faust-RD
* **Primary Engine:** Programmatic Script (Zero-LLM Cost Code)
* **Technical Mechanism:** A deterministic parsing algorithm. It acts as the factory foreman between Tier 2 and Tier 3.
* **Responsibility:** Intercepts the raw System Blueprint JSON from Tier 2, validates the schemas, parses the atomic work packages, and automatically queues parallel execution scripts for Tier 3 workers without bloating the Lead Architect's context window.

### Tier 3: Execution Workers (The Digital Factory Floor) // Combo: Faust-TH
* **Primary Models (Groq Cloud):** `Qwen3 32B` (UI/Layout Specialist) & `Llama 3.3 70B` (Logic Worker)
* **Assigned Routing Strategy:** `Reset-Aware RR` (via 7 CLI Accounts)
* **Technical Mechanism:** Executes a round-robin rotation across available accounts that natively tracks provider `reset-window` metrics. If a specific account encounters a `429 Too Many Requests` limit, the router temporarily quarantines it and channels bulk requests to remaining active pipelines.
* **Responsibility:** Write isolated code blocks, modular layout styles, and run compiler loops on ultra-fast Groq inference engines, incurring zero token drain on your primary Google/Claude accounts.

---

## 3. The Multi-Level Critique & Verification Loop

To eliminate model hallucinations, every tier operates within a dedicated critique loop rather than relying on an isolated model's self-evaluation.

### Level 1 Critique: Intent Verification
* **Mechanism:** `Gemini 3.7 Flash (Tiered)` maps the input, while an independent lightweight validator checks for ambiguous constraints.
* **HITL Gate:** Renders a clean markdown checklist for the human user to approve (`Y/N`) before engineering starts.

### Level 2 Critique: Architectural Peer Review (Cross-Model Debate)
* **Mechanism:** To break the **Echo Chamber Effect** (where an isolated model agrees with its own hallucinated architecture due to identical training weights), `Claude Sonnet 4.6`'s architectural blueprint is cross-examined by `Gemini 3.7 Flash (High)`.
* **Goal:** Verify dependency trees, clean architecture principles, and enforce hard API contracts before code generation.

### Level 3 Critique: Execution Verification (CRITIC via Compiler)
* **Mechanism:** Workers (Tier 3) are optimized for high throughput but prone to local syntax typos. Code validation is offloaded to a deterministic environment (**Docker Sandbox / Compiler / CI-CD Test Pipeline**) rather than an LLM.
* **The Self-Healing Loop:**
  1. The Groq Worker generates a micro-module code snippet.
  2. The system saves the file locally and triggers terminal diagnostics (`tsc`, `eslint`, `vitest`, `pytest`, `mypy`).
  3. If compilation fails, the **exact CLI Terminal error stream** is caught and injected back into the Worker's context as a system alert.
  4. The Worker uses the precise line-and-column diagnostic data to patch the file. It has a budget of **4 localized retries**. If it fails to compile past this threshold, it flags an escalation exception back up to Tier 2.

---

## 4. Operational Routing Instructions for Local Agent-OS
1. **Never allow Tier 3 Workers to communicate directly with User Interfaces.** All worker bugs must be processed and resolved via local terminal logs first.
2. **Enforce rigid data contracts** prior to kicking off parallel worker scripts. This ensures concurrent files written by separate Groq engines integrate flawlessly.
3. **Toggle Autonomous vs. HITL via state flags:** When `AUTONOMOUS = true`, the system auto-merges code that passes all Tier 3 sandbox validations. When `false`, the system halts at designated gates and generates a standardized Git Pull Request (PR) markdown view for human code review.
