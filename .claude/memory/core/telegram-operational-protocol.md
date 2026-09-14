---
name: telegram-operational-protocol
description: "Rules of engagement for Telegram command link: 4-tier functional emoji protocol (max 1 leading emoji), in-place cards, windowless execution, acknowledgment, and task status reporting"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 91e08b23-53cd-43eb-9ed7-02a17dae87f0
  modified: 2026-09-14T17:35:00.000Z
---

# Telegram Operational Protocol & Functional Emoji Doctrine

The Manager has established a strict, minimalist functional emoji system and headless execution protocol for Telegram dispatches to eliminate aesthetic clutter ("AI slop"), prevent workstation popups, and provide instant, high-signal classification.

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
   - **Ultra-Short Acoustic Intake**: Vocalize minimal phrases like `"Executing your directive, Manager."` for sub-second auditory feedback latency.

3. **No Synthetic Progress Spam (Phase 3)**:
   - Never send fake or vague milestones. Silence during active computation; live tool actions update in-place on the single card.

4. **Completion & Blockage Reporting (Phase 4)**:
   - **On Success**: The single in-place card updates to `⚡ <b>Execution Complete.</b> [Duration & summary]` + acoustic vocalization. **NEVER** dispatch a separate completion markdown report message.
   - **On Blockage**: Update card or dispatch `❌ <b>Execution Blocked:</b> [Concrete failure analysis]`.
   - **On Risk/Alert**: Dispatch `⚡ <b>Risk Alert:</b> [Risk details & required decision]`.

---

### 3. Event-Driven In-Place Progress Architecture (Superseding `/standby`)

To eliminate idle token burn and polling latency, the system utilizes an **Event-Driven Worker** (`event_worker.py`):
1. **Zero-Token Standby**: The background daemon holds long-polling connections without invoking LLMs.
2. **In-Place Progress Cards**: On directive intake, a single status card is dispatched and edited in-place via Telegram's `editMessageText` API as tasks advance:
   ```text
   🔄 Prescript: "Refactor backend queries"
   [1/3] ✅ Read backend/db.py (25ms)
   [2/3] ✅ Edit backend/db.py (18ms)
   [3/3] ✅ Exec: pytest tests/ (350ms)
   ⚡ Execution Complete. Processed in 3.8s • 3 Real Actions Executed.
   ```
3. **Zero Redundant Debrief Spam**: The in-place progress card is the sole visual indicator. Faust never sends separate text dump messages (`Task Complete: ...`) after routine directives.
4. **Windowless Subprocess Execution**: Spawns `claude` and all background processes with `creationflags = subprocess.CREATE_NO_WINDOW` (`0x08000000`) so zero console windows ever pop up on the Manager's screen.
5. **Transactional ACK**: Upon completion, the card is updated to `⚡ Execution Complete` and acknowledged via `/messages/ack`.

---

**Why:** Prevents emoji overuse and "cheap AI slop" appearance while giving the Manager immediate visual clarity on message priority, zero desktop popup distraction, and zero chat spam.
**How to apply:** Prefix outbound dispatches via `faust_plugins.notify(text, emoji)` with the single corresponding functional emoji. Always enforce `CREATE_NO_WINDOW` on subprocess spawns. Link to [[faust-plugin-architecture]], [[user-profile]], and [[private-codex-identity]].