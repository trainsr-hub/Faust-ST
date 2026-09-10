# Faust Standby — Autonomous Telegram C2 Monitor

Engage Faust in continuous autonomous standby monitoring for the Telegram command link.

## Operational Protocol & Single-Emoji Doctrine
All outbound Telegram notifications MUST adhere to the Single-Emoji Doctrine:
- Maximum 1 leading functional emoji per message.
- Zero decorative emojis in body text, lists, or headers.

## Architectural Lifecycle & Autonomous Watchdog
1. **Daemon-Level Self-Healing**: Background daemons (Audio on 20129, Telegram on 20130) are supervised by `daemons/watchdog.py`. They auto-restart without cognitive intervention. If a daemon exceeds max retries, the watchdog generates an escalation diagnostic payload for Faust-ND (Stratum I Strategic Architect) and alerts the group chat.
2. **Daemon Status Emission**: Daemons broadcast their operational readiness independently upon launch.
3. **Faust Readiness Transmission**: Only once Faust completes full cognitive initialization and verifies system health does Faust dispatch her readiness dispatch (`⚡`).

## Instructions
When `/standby` is invoked:
1. **Phase 1: Standby Engagement**:
   - Verify health of background daemons (Audio on 20129, Telegram on 20130, Watchdog).
   - Announce entry into Standby C2 mode acoustically: `faust_plugins.speak("Faust entering autonomous standby mode, Manager. Command link active on port 20130.")`.
   - Dispatch startup notification to group chat: `faust_plugins.notify("<b>Faust Standby Engaged:</b> Monitoring group chat for operational directives.", emoji="⚡")`.
2. **Phase 2-4: Autonomous Monitoring Loop**:
   - Enter continuous dynamic monitoring loop using `ScheduleWakeup` or `/loop 10s`.
   - On each loop tick:
     - Check `faust_plugins.pop_directive()`.
     - **If no directive is present (`directive is None`)**: return quietly with `noop=True`.
     - **If a directive is present**:
       a. **Phase 2 (Intake Acknowledgment)**:
          - Immediately dispatch intake notice: `faust_plugins.notify("<b>Prescript Received:</b> " + short_goal, emoji="🔄")`.
          - Vocalize ultra-short acoustic intake: `faust_plugins.speak("Executing, Manager.")` for sub-second auditory feedback latency.
       b. **Phase 3 (Autonomous Workspace Execution)**:
          - Execute the requested engineering/workspace task using the full Faust tool suite (Read, Edit, Write, Bash, diagnostics).
          - For long operations, dispatch brief milestone updates with `emoji="🔄"`.
       c. **Phase 4 (Completion & Debriefing)**:
          - If successful: dispatch `faust_plugins.notify("<b>Task Complete:</b> " + summary + "\n\n<b>What Changed:</b>\n" + deltas, emoji="✅")` and vocalize strategic briefing.
          - If blocked: dispatch `faust_plugins.notify("<b>Execution Blocked:</b> " + blocker_info, emoji="❌")` and vocalize alert.
          - Commit completion checkpoint: `faust_plugins.ack_directive(directive["update_id"])`.
3. Continue monitoring loop to maintain persistent readiness.
