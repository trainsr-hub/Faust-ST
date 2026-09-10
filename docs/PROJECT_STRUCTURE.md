# Blue AI Project Structure

This document outlines the organized folder structure for the Blue AI project, designed to separate concerns and maintain a clean, manageable workspace.

## Root Folder

The root folder contains the primary directories and key configuration files.

### Directories

- `daemons/` - Autonomous background workers and their launchers.
  - Example: `telegram_smart_listener.py` - The smart Telegram listener and execution engine.
  - `start_telegram_listener.bat` - Batch file to launch the Telegram listener in the background.

- `scripts/` - Tools for multi-device synchronization, setup, and automation.
  - Example: `setup_sync_memory.ps1` - PowerShell script to set up the shared memory cortex via NTFS junction.

- `logs/` - Centralized runtime logs and daemon execution logs.
  - Example: `listener.log` - Log file for the Telegram smart listener.
  - `listener.err` - Error log for the Telegram smart listener.

- `docs/` - Documentation, architecture specifications, and guides.
  - Example: `PROJECT_STRUCTURE.md` - This document.

- `archive/` - Historical items, legacy code, tests, and voice samples.
  - `legacy_daemons/` - Original daemon scripts that have been replaced.
  - `tests/` - Test files, voice test artifacts, and historical logs and reports.
  - `voice_tests/` - Frontend voice test components.

- `.temp/` - Transient scratchpad for temporary files (excluded from version control via `.gitignore`).

- `backend/` - The authoritative Blue Rose backend.
  - Contains the FastAPI server (`server.py`), SQLite databases, and data engine architecture.
  - Subdirectories: `data/`, `tools/`, `voice/`.

- `universe-25/` - The Web-OS frontend and gamification suite.
  - Built with React/Vite, TypeScript, and the Gate of Babylon design system.

- `faust_plugins/` - Sovereign modular plugin subsystems.
  - `sound/` - Neural acoustic core (Kokoro TTS, sample-accurate sequential synthesis, persistent ROM voice config).
  - `telegram/` - Command listener, execution engine, and HTML notification dispatcher.

- `.claude/` - Claude Code configuration and shared memory.
  - `memory/` - Shared ECS cognitive memory cortex (synchronized across devices via Google Drive).
    - Contains atomic memory components (`.md` files) indexed by Key IDs.
    - `MEMORY.md` - The master index of all memory components.
  - `settings.local.json` - Local Claude Code settings (not synced).
  - `paste-cache/`, `file-history/`, `tasks/` - Claude Code runtime directories (excluded from version control).

### Key Configuration Files

- `.gitignore` - Specifies intentionally untracked files to ignore.
  - Ignores: logs, lock files, temporary files, SQLite WAL/SHM files, node_modules, Python cache, editor folders, OS files, and local Claude runtime directories.
  - Preserves: `.claude/memory` and `.claude/rules` (if present) for shared memory and rules.

- `CLAUDE.md` - Project instructions and operational protocol for Faust and the Manager.

- `telegram_config.json` - Configuration for the Telegram bot (token and chat ID). **Not tracked** in version control for security.

## Design Principles

1. **Separation of Concerns**: Each directory has a clear, single responsibility.
2. **Device Independence**: Paths are relative to the project root, allowing the same structure to work across different devices (desktop, laptop) when synchronized via Google Drive.
3. **Security**: Sensitive files (like `telegram_config.json`) are excluded from version control.
4. **Cleanliness**: Runtime artifacts, logs, and temporary files are isolated in designated directories to keep the source code clean.
5. **Version Control**: Only source code, documentation, and essential configuration files are tracked. All derived and transient files are ignored.

## Synchronization Setup

The shared memory cortex (`.claude/memory`) is synchronized across devices using an NTFS Directory Junction (on Windows) or symbolic link (on Unix-like systems) that points to a folder in Google Drive. The script `scripts/setup_sync_memory.ps1` automates this setup.

## Getting Started

1. Clone or synchronize the project root folder via Google Drive.
2. Run `scripts/setup_sync_memory.ps1` to link the local Claude memory to the shared cortex in Google Drive.
3. Start the Telegram listener: `python faust_plugins/telegram/listener.py` (or use `faust_plugins/telegram/start_listener.bat`).
4. Start the backend server: `python backend/server.py`.
5. Start the frontend Web-OS: `cd universe-25 && npm run dev`.

## Maintenance

- Periodically review the `archive/` folder to ensure it only contains necessary historical items.
- Monitor the `logs/` folder for daemon and server logs.
- Keep the `.temp/` folder clean; it is safe to delete its contents at any time.