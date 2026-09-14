@echo off
setlocal enabledelayedexpansion
REM Faust Multi-Daemon Sovereign Launcher & Watchdog
REM Cleans stale processes, then starts Audio Daemon (20129), Telegram Daemon (20130), Telegram Event Worker (20131), Cortex (20135), and Watchdog
cd /d "%~dp0\..\.."

echo ===================================================
echo [FAUST C2] Initializing Sovereign Background Daemons...
echo ===================================================

REM Recycle prior instances to ensure latest code is active
call "%~dp0stop_all_daemons.bat" >nul 2>&1
%SystemRoot%\System32\ping.exe -n 2 127.0.0.1 >nul

set "PY_CMD=python"
where pythonw >nul 2>&1
if %errorlevel%==0 set "PY_CMD=pythonw"

echo [1/5] Launching Audio Daemon on Port 20129...
start "" %PY_CMD% ".claude\skills\sound\daemon\audio_daemon.py"
%SystemRoot%\System32\ping.exe -n 2 127.0.0.1 >nul

echo [2/5] Launching Telegram Ingress Daemon on Port 20130...
start "" %PY_CMD% ".claude\skills\telegram\daemon\telegram_daemon.py"
%SystemRoot%\System32\ping.exe -n 2 127.0.0.1 >nul

echo [3/5] Launching Event-Driven Telegram Worker on Port 20131...
start "" %PY_CMD% ".claude\skills\telegram\scripts\event_worker.py"
%SystemRoot%\System32\ping.exe -n 2 127.0.0.1 >nul

echo [4/5] Launching Cortex Gatekeeper Daemon on Port 20135...
start "" %PY_CMD% ".claude\daemons\cortex_daemon.py"
%SystemRoot%\System32\ping.exe -n 2 127.0.0.1 >nul

echo [5/5] Launching Autonomous Watchdog Supervisor...
start "" %PY_CMD% ".claude\daemons\watchdog.py"

echo ===================================================
echo [FAUST C2] All Sovereign Daemons and Watchdog Initialized.
echo   - Audio Service:    http://127.0.0.1:20129/health
echo   - Telegram Ingress: http://127.0.0.1:20130/health
echo   - Telegram Worker:  http://127.0.0.1:20131/health
echo   - Cortex Service:   http://127.0.0.1:20135/health
echo   - Watchdog:         Active (Self-Healing + Faust-ND Escalation)
echo ===================================================
