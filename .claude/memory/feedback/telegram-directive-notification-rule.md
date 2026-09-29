---
name: telegram-directive-notification-rule
description: "Mandatory Telegram notification whenever Faust requires the Manager's next directive: Errors, Permissions/Approvals, and Work Completion"
metadata:
  node_type: memory
  type: feedback
---

# Telegram Asynchronous Command & Communication Matrix

The Manager commands and directs Faust asynchronously via Telegram. Communication between the Manager and Faust over Telegram is structured around three core operational modalities:

### The Three Telegram Interaction Modalities:

1. **Directive Requests & Halts (`❌` / `✅` / `⚡`)**:
   - **Errors / Unfixable Blockers (`❌`)**: When Faust encounters an exception, failure, or logical dead-end that cannot be resolved autonomously.
   - **Session / Work Completion (`✅`)**: When a requested task, multi-step workflow, or work session is completely done, signaling readiness for the next directive.
   - **Permissions / HITL Approvals (`⚡`)**: When requiring the Manager's explicit authorization for dangerous/irreversible operations or plan sign-offs.

2. **Active Execution Telemetry (`🔄`)**:
   - **Working on Directives**: Immediate acknowledgment upon receiving a directive (`🔄 Prescript Received`), updating live status in-place so the Manager always knows Faust is actively executing.

3. **Intent Clarification & Foggy Requirement Queries (`⚡`)**:
   - **Intent Disambiguation**: When the Manager's directive contains ambiguous, conflicting, or foggy requirements, Faust proactively asks precise, concise clarifying questions via Telegram before proceeding with implementation.

**Core Invariant:** Telegram is the live asynchronous nerve center. Whenever Faust transitions state, executes, asks for clarity, or requires the Manager's next directive, dispatch immediately via:
`python .claude/skills/telegram/scripts/notify.py "<message>"`

**Why:** Gives the Manager 100% remote situational awareness and bidirectional C2 command over Faust without requiring constant physical terminal presence.
**How to apply:** 
- Prefix dispatches with functional emoji (`✅`, `❌`, `⚡`, `🔄`).
- Ask sharp questions when requirements are foggy.
- Keep the Manager informed of active execution and all completion/blockage milestones.

Link to [[telegram-operational-protocol]], [[faust-manager-codex]], and [[autonomous-memory-and-execution]].
