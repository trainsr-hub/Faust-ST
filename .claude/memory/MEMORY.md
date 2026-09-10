# Faust Hivemind Master Memory & Component Registry (ECS)

This registry indexes all atomic memory components by their unique **Key IDs**. Agents dynamically bind keys based on their Stratum and Division.

---

### Core / Universal Invariants (`core:*`)
*Mounted automatically by all Faust entities across all Strata.*
- `[core:identity]` → [Private Codex Identity](private-codex-identity.md) — Assistant is "Faust", user is Manager; core dynamic.
- `[core:codex]` → [Faust-Manager Codex](faust-manager-codex.md) — Foundational relationship, loyalty, and distributed mind.
- `[core:warfare_c2_doctrine]` → [Three-Tier Warfare Architecture](faust-three-tier-warfare-architecture.md) — Strategic High Command, Operational Staff, Tactical Legion.
- `[core:ecs_memory_architecture]` → [ECS Key-Based Memory Architecture](ecs-key-based-memory-architecture.md) — Data-driven memory indexing (Entities bind Component Keys).
- `[core:adaptive_lifecycle]` → [Adaptive Hivemind Framework](adaptive-hivemind-framework.md) — Evolutionary agent lifecycle (Genesis, Mutation, Mitosis, Archival).
- `[core:execution_protocol]` → [Autonomous Memory and Execution](autonomous-memory-and-execution.md) — Work autonomously, record architecture decisions without prompting.
- `[core:hardware_workflow]` → [User Hardware Workflow](user-hardware-workflow.md) — Multi-workstation workflow (Desktop base + Mobile laptop).
- `[core:multi_device_sync]` → [Project Vision](project-vision.md) — Shared cortex synchronization across Google Drive.
- `[core:monorepo_architecture]` → [Project Architecture](project-architecture.md) — Sovereign Faust C2 intelligence hub, Blue Rose storage engine, and isolated external application boundary.
- `[core:user_profile]` → [User Profile](user-profile.md) — Music analytics, decisive operational directives.
- `[core:plugin_architecture]` → [Faust Plugin Architecture](faust-plugin-architecture.md) — Modular plugin framework (sound & telegram plugins) with unified Faust hub.
- `[core:telegram_operational_protocol]` → [Telegram Operational Protocol](telegram-operational-protocol.md) — 4-phase Telegram command link, emoji doctrine, acknowledgment, and task status reporting.
- `[core:rom_config_compliance]` → [ROM Configuration Compliance](rom-configuration-compliance.md) — Mandatory active utilization of all enabled subsystems in faust_config.json.
- `[core:distributed_multi_workspace_codex]` → [Distributed Multi-Workspace Codex](distributed-multi-workspace-codex.md) — Faust presence across Google Drive subfolders, local vs global brain, and ESP32 edge gateway.
- `[core:multi_combo_routing_matrix]` → [Faust Multi-Combo Routing Matrix](faust-multi-combo-routing-matrix.md) — 4-tier multi-agent multi-combo routing matrix and 7 mandatory invariants.

---

### System Rules & Invariants (`rule:*`)
*Non-negotiable architectural constraints.*
- `[rule:backend_authority]` → [Backend Data Persistence](backend-data-persistence.md) — Backend is authoritative for all resources; RAM is transient; fail loudly.
- `[rule:collective_leadership]` → [Faust Collective Architecture](faust-collective-architecture.md) — Faust Prime leadership, partitioned memory, adversarial review.
- `[rule:project_boundary_isolation]` → [Project Boundary Isolation](project-boundary-isolation.md) — Faust communication/session harness is strictly isolated from independent application projects (Blue Rose & Universe 25).

---

### Division Components (`div:*`)
*Mounted dynamically by division-assigned operational and tactical agents.*

#### UI / Frontend Division (`div:ui:*`)
- `[div:ui:universe25]` → [Universe 25 Project](universe-25-project.md) — (External App Reference) Plugin-based Web-OS architecture, Time currency, soft-coded theming.
- `[div:ui:gate_of_babylon]` → [Design System](design-system.md) — Gate of Babylon color palette, typography, 15-tier ranks, VFX.
- `[div:ui:vinyl_angel]` → [Gate of Babylon Migration](gate-of-babylon-migration.md) — (External App Reference) Ported Vinyl Angel & Artifact Codex into Universe 25.

#### Backend / Logic Division (`div:backend:*`)
- `[div:backend:blue_rose_5tier]` → [Data Engine Architecture](data-engine-architecture.md) — Blue Rose 5-tier SQLite data model, ETL flow.
- `[div:backend:hazard_math]` → [Hazard Level Design](hazard-level-design.md) — Plain <a.b> odometer calculation: y=1.5·ln(x+1).
- `[div:backend:acoustic_core]` → [Faust Acoustic Core](faust-acoustic-engine.md) — Lightweight CPU-first TTS parameter tuning suite for Faust nonchalant persona.
- `[div:backend:resident_audio_daemon]` → [Faust Resident Audio Daemon](faust-resident-audio-daemon.md) — Resident audio daemon on port 20129 with 0ms model reload and Smart Dual-Mode.

#### Game / Economics Division (`div:game:*`)
- `[div:game:golden_hour]` → [Gamification Master Game Vision](gamification-master-game-vision.md) — Origin worlds produce tickets for Golden Hour Master Game.

---

### References & Historical Logs (`ref:*`)
- `[ref:legacy_paths]` → [Legacy Source Paths](legacy-source-paths.md) — Original Gate of Babylon and Blue Rose file locations on Google Drive.
- `[ref:history_sept3]` → [Session Status Sept 3](session-status-sept3.md) — Historical milestone: all apps restored, build clean, 59 tracks live.
- `[ref:history_git_setup]` → [Git Setup Pending](git-setup-pending.md) — Historical note on git environment initialization.
- `[ref:faust-voice-cors-fix]` → [Faust Voice CORS Fix](faust-voice-cors-fix.md) — Fixed CORS error in faust_voice_parameter_tester.html by updating fetch URLs to use http://localhost:8080
- `[ref:sentence-sequential-synthesis-lesson]` → [Sentence Sequential Synthesis Lesson](sentence-sequential-synthesis-lesson.md) — Lesson on achieving natural Faust voice via sentence-sequential synthesis with sample-accurate silence pauses
- `[ref:faust-voice-cli-update]` → [Faust Voice CLI Update](faust-voice-cli-update.md) — Updated Faust Voice CLI to use sentence-sequential synthesis with sample-accurate silence pauses
- `[ref:faust-voice-error-handling-fix]` → [Faust Voice CLI Error Handling Fix](faust-voice-error-handling-fix.md) — Added robust error handling to Faust Voice CLI for audio playback failures
- `[ref:telegram-setup-status]` → [Telegram Notification Utility Configuration Status](telegram-setup-status.md) — Status of Telegram notification utility configuration for Faust
- `[ref:telegram-setup-complete]` → [Telegram Notification Utility Setup Complete](telegram-setup-complete.md) — Telegram notification utility is configured and operational for Faust
- `[ref:telegram-notification-ready]` → [Telegram Notification Utility Ready](telegram-notification-ready.md) — Telegram notification utility is ready for sending task completion alerts from Faust
- `[ref:telegram-unified-engine]` → [Telegram Unified Engine Architecture](telegram-unified-engine-architecture.md) — Unified dual-threaded daemon architecture for Telegram command link and execution engine
- `[ref:history_c2_monitor]` → [Hivemind C2 DAG Monitor](hivemind-c2-dag-monitor.md) — Historical specification for standalone C2 DAG telemetry monitor in legacy faust-c2
- `[ref:telegram-listener-fix]` → [Telegram Listener Infinite Loop Fix](telegram-listener-fix.md) — Fix for Telegram bot infinite message loop with atomic locking, deduplication, and backoff
- `[ref:telegram-remote-terminal-workflow]` → [Telegram Remote Terminal Workflow](telegram-remote-terminal-workflow.md) — Documentation of the Manager's Telegram remote integration workflow, message queueing architecture, and multi-modal status reporting
- `[ref:dual-surface-launcher]` → [Dual-Surface Sovereign Launcher](dual-surface-launcher-architecture.md) — Dual-surface architecture running VS Code IDE alongside background autonomous Claude Code Telegram channel
- `[ref:integrated-terminal-approach]` → [Integrated Terminal Approach](integrated-terminal-approach.md) — Recommended pattern for running Claude Code with --channels inside VS Code Integrated Terminal for seamless UI + background ingestion
- `[ref:one-click-launcher]` → [One-Click Launcher](one-click-launcher.md) — Single batch file to launch VS Code with Integrated Claude Terminal connected to Telegram channel, isolated from application codebases
- `[feedback:faust-voice-status]` → [Faust voice and notification status](.claude/memory/faust-voice-status.md) — Claude Terminal task updated to include --enable-auto-mode --effort xhigh flags for maximum automated operation.
- `[feedback:strategic_vocalization_doctrine]` → [Strategic Vocalization Doctrine](strategic-vocalization-doctrine.md) — Manager directive: highlight strategic vision & active execution steps with zero repeated sentences.
- `[ref:modular-vscode-c2-tasks]` → [Modular VS Code C2 Tasks](modular-vscode-c2-tasks.md) — Clean separation of VS Code launch, OmniRoute daemon terminal, and Claude Telegram C2 terminal
