---
name: telegram-operational-protocol
description: "Rules of engagement for Telegram command link: 4-tier functional emoji protocol (max 1 leading emoji), acknowledgment, and task status reporting"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 91e08b23-53cd-43eb-9ed7-02a17dae87f0
  modified: 2026-09-10T06:43:20.201Z
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
     `🔄 <b>Prescript Received:</b> [Goal]` (Dispatched strictly when execution begins; Faust proceeds immediately).
   - **Ultra-Short Acoustic Intake**: Vocalize minimal phrases like `"Executing, Manager."` or `"On it, Manager."` for sub-second auditory feedback latency.

3. **No Synthetic Progress Spam (Phase 3)**:
   - Never send fake or vague milestones. Silence during active computation; dispatches occur only upon transition or completion.

4. **Completion & Blockage Reporting (Phase 4)**:
   - **On Success**: `✅ <b>Task Complete:</b> [Concrete technical summary]\n\n<b>What Changed:</b>\n• [Specific delta 1]\n• [Specific delta 2]` → Wait for Manager.
   - **On Blockage**: `❌ <b>Execution Blocked:</b> [Concrete failure analysis]` → Wait for Manager.
   - **On Risk/Alert**: `⚡ <b>Risk Alert:</b> [Risk details & required decision]` → Pause & wait for Manager.

---

### 3. Event-Driven In-Place Progress Architecture (Superseding `/standby`)

To eliminate idle token burn and polling latency, the system utilizes an **Event-Driven Worker** (`event_worker.py`):
1. **Zero-Token Standby**: The background daemon holds long-polling connections without invoking LLMs.
2. **In-Place Progress Cards**: On directive intake, a single status card is dispatched and edited in-place via Telegram's `editMessageText` API as tasks advance:
   ```text
   🔄 Prescript: "Refactor backend queries"
   [1/6] ✅ Ingress & Whitelist Gate (12ms)
   [2/6] ✅ Intent Routing & Acoustic Alert (74ms)
   [3/6] ⏳ C2 Dispatcher & Blueprint Validation (Running...)
   [4/6] ⚪ Multi-Agent Execution & Code Synthesis
   [5/6] ⚪ Egress Debrief & Speech Synthesis
   [6/6] ⚪ Commit SQLite Transaction
   ```
3. **Transactional ACK**: Upon completion, the card is updated to `⚡ Execution Complete` and acknowledged via `/messages/ack`.

---

**Why:** Prevents emoji overuse and "cheap AI slop" appearance while giving the Manager immediate visual clarity on message priority and required action.
**How to apply:** Prefix outbound dispatches via `faust_plugins.notify(text, emoji)` with the single corresponding functional emoji. Link to [[faust-plugin-architecture]], [[user-profile]], and [[private-codex-identity]].
