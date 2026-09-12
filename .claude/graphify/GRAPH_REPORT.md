# Graph Report - Blue AI  (2026-09-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 329 nodes · 573 edges · 16 communities (13 shown, 1 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `741c96e4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13

## God Nodes (most connected - your core abstractions)
1. `SoundEngine` - 27 edges
2. `get_engine()` - 23 edges
3. `is_acoustic_presence_enabled()` - 17 edges
4. `load_rom_config()` - 17 edges
5. `TelegramPollerWorker` - 12 edges
6. `toggle_acoustic_presence()` - 12 edges
7. `set_acoustic_presence_enabled()` - 11 edges
8. `save_rom_config()` - 10 edges
9. `speak()` - 10 edges
10. `DedupManager` - 9 edges

## Surprising Connections (you probably didn't know these)
- `SoundEngine` --uses--> `VoiceConfig`  [INFERRED]
  .claude/skills/sound/scripts/engine.py → .claude/skills/sound/scripts/config.py
- `AudioQueueWorker` --uses--> `SoundEngine`  [INFERRED]
  .claude/skills/sound/daemon/audio_daemon.py → .claude/skills/sound/scripts/engine.py
- `run_parameter_sweep()` --calls--> `SoundEngine`  [INFERRED]
  .claude/skills/sound/scripts/tune_faust_voice.py → .claude/skills/sound/scripts/engine.py
- `escalate_to_faust_nd()` --calls--> `notify()`  [INFERRED]
  .claude/daemons/watchdog.py → .claude/skills/telegram/__init__.py
- `test_preload_performance()` --calls--> `SoundEngine`  [EXTRACTED]
  .claude/skills/sound/references/test_improvements.py → .claude/skills/sound/scripts/engine.py

## Import Cycles
- None detected.

## Communities (16 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (73): get_status(), health_check(), lifespan(), FastAPI, get, Faust Resident Audio Daemon (Tier 1 Acoustic Service) Maintains Kokoro neural…, toggle_endpoint(), is_daemon_running() (+65 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (36): AckDirectiveRequest, acknowledge_directive(), acquire_mutex_lock(), clear_queue(), DedupManager, get_status(), health_check(), is_pid_running() (+28 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (30): ndarray, Path, Self-contained neural TTS engine for Faust. Implements sentence-sequential…, Resolve paths to Kokoro ONNX model and voice binaries., Lazy-load Kokoro ONNX instance thread-safely., Preload neural weights into memory and perform micro-warmup. Call during…, Release audio devices, stop background workers, and clean up resources., Append spoken text to daily transcript log in… (+22 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (32): main(), notify_telegram(), Send discreet notification to Telegram., Faust Turn Hook - Silent event handler for session telemetry and optional…, Main hook entry point (silent execution, zero speech talkback)., ack_directive(), get_status(), is_daemon_running() (+24 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (13): BaseHTTPRequestHandler, CortexHTTPHandler, log(), MemoryCortexIndex, parse_frontmatter(), Any, Path, In-memory cache of memory components, auto-refreshed on change. (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.21
Nodes (14): Synthesize and play speech. Uses resident daemon first for 0ms cold-start;…, shutdown(), speak(), main(), Run all improvement tests, Test script to validate Faust Sound Plugin improvements, Test that preload eliminates cold start latency, Test that voice blending creates varied output (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (8): AudioQueueWorker, PlaybackTask, BaseModel, post, Synthesize and play speech via resident RAM model. Returns in <2ms for non-…, Single-writer serialization queue for sound output to prevent device contention., speak_endpoint(), SpeakRequest

### Community 7 - "Community 7"
Cohesion: 0.24
Nodes (12): escalate_to_faust_nd(), get_log_tail(), is_service_healthy(), log(), Any, Path, Retrieve the last N lines from the daemon's log file., Record escalation packet for Stratum I (Faust-ND) diagnostic review. (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.24
Nodes (11): AtomicWorkPacket, BlueprintValidationResult, compute_blueprint_sha(), execute_self_healing_compiler_check(), parse_and_validate_blueprint(), Any, Path, Execute Level 3 Execution Verification (Compiler / Diagnostics check). Returns… (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (9): main(), parse_frontmatter(), Any, Path, query_daemon_resolve(), Deterministic offline fallback resolution directly against disk., Faust Deterministic Memory Resolver CLI (Zero-LLM Tool) Resolves allowed memory…, Attempt to resolve keys via resident Cortex Daemon on Port 20131. (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.47
Nodes (5): create_junction(), Path, Faust Project Initializer & Manifest-Driven Memory Slicer (Python Primacy)…, Create NTFS Directory Junction on Windows., spawn_project()

### Community 12 - "Community 12"
Cohesion: 0.53
Nodes (5): benchmark_daemon_dispatch(), benchmark_in_process_inference(), check_daemon_status(), main(), Faust Acoustic Performance Benchmark Measures ACK latency, resident daemon vs…

### Community 13 - "Community 13"
Cohesion: 0.50
Nodes (3): Faust Voice Parameter Tuning Tool Located inside plugins/sound/tools/ for…, Run parameter sweep across speeds and pitches., run_parameter_sweep()

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SoundEngine` connect `Community 2` to `Community 0`, `Community 5`, `Community 6`, `Community 10`, `Community 13`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Why does `get_engine()` connect `Community 0` to `Community 2`, `Community 12`, `Community 5`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `SoundEngine` (e.g. with `AudioQueueWorker` and `VoiceConfig`) actually correct?**
  _`SoundEngine` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05339506172839506 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.0596078431372549 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07632850241545894 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.08907563025210084 - nodes in this community are weakly interconnected._