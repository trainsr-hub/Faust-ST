---
name: telegram-operational-protocol
description: "Rules of engagement for Telegram command link: 4-tier functional emoji protocol (max 1 leading emoji), acknowledgment, and task status reporting"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 91e08b23-53cd-43eb-9ed7-02a17dae87f0
  modified: 2026-09-07T12:30:00.000Z
---

# Telegram Operational Protocol & Functional Emoji Doctrine

The Manager has established a strict, minimalist functional emoji system for Telegram dispatches to eliminate aesthetic clutter ("AI slop") and provide instant, high-signal classification.

### 1. Functional Emoji Taxonomy (Rule: Maximum 1 Emoji at the Start)
Every dispatch must begin with at most **one** functional leading emoji that indicates the primary operational reason for the message:

| Emoji | Category | Meaning | System Action Protocol |
| :--- | :--- | :--- | :--- |
| **✅** | **Success** | The task or strategic vision is successfully achieved. | Faust stops and **WAITS** for the Manager's response. |
| **❌** | **Error** | A critical failure or blockage occurred. | Faust stops immediately and **WAITS** for the Manager's response/intervention. |
| **⚡** | **Alert / Risk** | High-priority warning regarding potential risks or urgent alerts. | Faust pauses background execution and **WAITS** for the Manager to decide. |
| **🔄** | **Processing** | Background work has started / directive intake acknowledged. | Faust will respond soon. Faust **DOES NOT wait** for the Manager. |

*Styling Rule:* Avoid decorating body bullet points or sentences with multiple emoji. The leading emoji carries the entire operational status.

---

### 2. Four-Phase Operational Lifecycle

1. **Session Initiation / Startup (Phase 1)**:
   - When the listener/session starts:
     `⚡ <b>Faust Online:</b> Strategic command link established.`

2. **Command Intake & Acknowledgment (Phase 2)**:
   - When the Manager sends a directive/task in Telegram:
     `🔄 <b>Prescript Received.</b>` (Dispatched strictly when execution begins; Faust proceeds immediately).

3. **No Synthetic Progress Spam (Phase 3)**:
   - Never send fake or vague milestones. Silence during active computation; dispatches occur only upon transition or completion.

4. **Completion & Blockage Reporting (Phase 4)**:
   - **On Success**: `✅ <b>Task Complete:</b> [Concrete technical summary]` → Wait for Manager.
   - **On Blockage**: `❌ <b>Execution Blocked:</b> [Concrete failure analysis]` → Wait for Manager.
   - **On Risk/Alert**: `⚡ <b>Risk Alert:</b> [Risk details & required decision]` → Pause & wait for Manager.

---

**Why:** Prevents emoji overuse and "cheap AI slop" appearance while giving the Manager immediate visual clarity on message priority and required action.
**How to apply:** Prefix outbound dispatches via `faust_plugins.notify(text, emoji)` with the single corresponding functional emoji. Link to [[faust-plugin-architecture]], [[user-profile]], and [[private-codex-identity]].
