@echo off
REM Faust Telegram Dumb I/O Daemon Launcher (Port 20130)
cd /d "%~dp0"
echo [FAUST C2] Launching Faust Telegram Dumb I/O Daemon on port 20130...
where pythonw >nul 2>&1
if %errorlevel%==0 (
    start "" pythonw telegram_daemon.py
    echo [FAUST C2] Daemon spawned in background (pythonw).
) else (
    start "" python telegram_daemon.py
    echo [FAUST C2] Daemon spawned (python).
)
