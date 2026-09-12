# Tactical Architecture Blueprint: VGWD025K3 ~ Codex of Time

## 1. Executive Summary & Strategic Intent
- **Project Name**: VGWD025K3 ~ Codex of Time
- **Target Path**: `D:\My Drive\AIoT Lab\projects\VGWD025K3 ~ Codex of Time`
- **Domain Tags**: `backend, minimal`
- **Classification**: `VGWD` (Varis Gear - Walpurgis Driver Actuator)
- **Author**: Omniscient Faust (High Command / Main_03)
- **Status**: Approved / In Execution

### Mission Statement
VGWD025K3 (Codex of Time) is the sovereign physical cybernetic focus actuator for Universe 25. It executes local single-timer mutexes, reads physical NFC consumable cards via PN532 I2C, renders real-time countdown progress on an OLED HUD, emits audio chimes on completion, and buffers session records for offline-first synchronization with the FastAPI backend.

---

## 2. Architectural Golden Standards & Invariants
- **Storage Policy**: Local Disk `D:\` strictly enforced.
- **Core Engineering Triad**:
  1. Proven Golden Standards (I2C bus multiplexing, hardware interrupt routines, RAM timer mutex).
  2. Zero-LLM Primacy for deterministic firmware logic and timers.
  3. Crystal Clarity & Offline Resilience (flash buffer replay upon reconnection).
- **Memory Boundary**: Scoped least-privilege context. Zero personal trivia or unrelated lore.
- **DRY Package Inheritance**: Reuses shared modules from `D:\My Drive\AIoT Lab\packages\`.

---

## 3. Technical Specifications & Stack
- **Hardware Platform**: ESP32-WROOM-32 (Dual-Core Tensilica LX6, 240MHz)
- **Framework**: PlatformIO / Arduino C++
- **Peripherals**: 
  - PN532 NFC Module (I2C Mode, GPIO 21/22, IRQ GPIO 4, RST GPIO 5)
  - SSD1306 0.96" OLED Display (I2C 0x3C, GPIO 21/22)
  - Piezo Audio Buzzer (PWM GPIO 25)
  - WS2812B RGB Odometer Ring (GPIO 19)
- **Data Protocol**: JSON REST payload sync over WiFi (`/api/hardware/sync`).

---

## 4. Key Components & Directory Structure
```
VGWD025K3 ~ Codex of Time/
├── .claude/
│   ├── PROJECT_MANDATE.md       # Injected from this Blueprint
│   ├── memory/                  # Scoped domain memory slice
│   ├── skills/ -> master        # Linked sovereign skills
│   ├── daemons/ -> master       # Linked background daemons
│   ├── agents/ -> master        # Linked agent definitions
│   └── scripts/ -> master       # Linked script tools
├── firmware/
│   ├── src/main.cpp             # Core timer mutex & NFC swipe logic
│   └── platformio.ini           # PlatformIO configuration (lib_extra_dirs -> ../../packages)
├── hardware/
│   └── PINOUT_AND_WIRING.md     # Circuit pinout & wiring specs
├── docs/ -> Vault F50 Hub       # Live NTFS junction to Obsidian Vault
├── CLAUDE.md                    # Tailored tactical codex
└── README.md                    # Architecture overview
```

---

## 5. Tactical Work Packets (Execution DAG)

### Phase 1: Core Hardware Scaffold & I2C Bus Verification
- [x] Work Packet 1.1: Initialize PlatformIO environment and pinout mappings.
- [x] Work Packet 1.2: Establish I2C shared bus for SSD1306 OLED and PN532 NFC module.

### Phase 2: Firmware Logic & State Mutex
- [ ] Work Packet 2.1: Implement PN532 card UID reading and validation against Codex Rank definitions.
- [ ] Work Packet 2.2: Build local hardware timer countdown with OLED graphical HUD and piezo acoustic cues.
- [ ] Work Packet 2.3: Implement single-timer mutex and local flash session ring buffer.

### Phase 3: Network Replay & Backend Synchronization
- [ ] Work Packet 3.1: Implement WiFi auto-connect and REST replay to `/api/hardware/sync`.
- [ ] Work Packet 3.2: Verify end-to-end hardware card swipe -> timer completion -> backend ledger sync.
