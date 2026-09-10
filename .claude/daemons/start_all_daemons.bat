@echo off
REM Faust Multi-Daemon Sovereign Launcher & Watchdog
REM Cleans stale processes, then starts Audio Daemon (Port 20129), Telegram Daemon (Port 20130), and Self-Healing Watchdog
cd /d "%~dp0\..\.."

echo ===================================================
echo [FAUST C2] Initializing Sovereign Background Daemons...
echo ===================================================

REM Recycle prior instances to ensure latest code is active
call ".claude\daemons\stop_all_daemons.bat" >nul 2>&1
timeout /t 1 /nobreak >nul

where pythonw >nul 2>&1
if %errorlevel%==0 (
    echo [1/3] Launching Audio Daemon (Port 20129)...
    start "" pythonw ".claude/skills/sound/daemon/audio_daemon.py"
    timeout /t 1 /nobreak >nul

    echo [2/3] Launching Telegram Daemon (Port 20130)...
    start "" pythonw ".claude/skills/telegram/daemon/telegram_daemon.py"
    timeout /t 1 /nobreak >nul

    echo [3/3] Launching Autonomous Watchdog Supervisor...
    start "" pythonw ".claude/daemons/watchdog.py"
) else (
    echo [1/3] Launching Audio Daemon (Port 20129)...
    start "" python ".claude/skills/sound/daemon/audio_daemon.py"
    timeout /t 1 /nobreak >nul

    echo [2/3] Launching Telegram Daemon (Port 20130)...
    start "" python ".claude/skills/telegram/daemon/telegram_daemon.py"
    timeout /t 1 /nobreak >nul

    echo [3/3] Launching Autonomous Watchdog Supervisor...
    start "" python ".claude/daemons/watchdog.py"
)

echo ===================================================
echo [FAUST C2] All Sovereign Daemons & Watchdog Initialized.
echo   - Audio Service:    http://127.0.0.1:20129/health
echo   - Telegram Service: http://127.0.0.1:20130/health
echo   - Watchdog:         Active (Self-Healing + Faust-ND Escalation)
echo ===================================================
