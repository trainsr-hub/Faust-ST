@echo off
setlocal enabledelayedexpansion
REM Faust Sovereign Daemons Teardown
cd /d "%~dp0\..\.."

echo ===================================================
echo [FAUST C2] Stopping Faust Background Daemons...
echo ===================================================

REM 1. Stop Watchdog via lockfile PID if present
if exist ".claude\daemons\watchdog.lock" (
    set /p WD_PID=<".claude\daemons\watchdog.lock"
    if defined WD_PID (
        echo Stopping Watchdog PID !WD_PID!...
        taskkill /F /PID !WD_PID! >nul 2>&1
    )
    del /f /q ".claude\daemons\watchdog.lock" >nul 2>&1
)

REM 2. Stop Telegram Ingress Daemon via lockfile PID if present
if exist ".claude\skills\telegram\daemon\telegram_daemon.lock" (
    set /p TG_PID=<".claude\skills\telegram\daemon\telegram_daemon.lock"
    if defined TG_PID (
        echo Stopping Telegram Ingress Daemon PID !TG_PID!...
        taskkill /F /PID !TG_PID! >nul 2>&1
    )
    del /f /q ".claude\skills\telegram\daemon\telegram_daemon.lock" >nul 2>&1
)

REM 3. Stop Cortex Gatekeeper Daemon via lockfile PID if present
if exist ".claude\daemons\cortex_daemon.lock" (
    set /p CTX_PID=<".claude\daemons\cortex_daemon.lock"
    if defined CTX_PID (
        echo Stopping Cortex Daemon PID !CTX_PID!...
        taskkill /F /PID !CTX_PID! >nul 2>&1
    )
    del /f /q ".claude\daemons\cortex_daemon.lock" >nul 2>&1
)

REM 4. Terminate processes listening on port 20135 (Cortex)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":20135" ^| findstr "LISTENING"') do (
    echo Terminating Cortex daemon PID %%a on port 20135...
    taskkill /F /PID %%a >nul 2>&1
)

REM 5. Terminate processes listening on port 20131 (Telegram Event Worker)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":20131" ^| findstr "LISTENING"') do (
    echo Terminating Telegram Worker PID %%a on port 20131...
    taskkill /F /PID %%a >nul 2>&1
)

REM 6. Terminate processes listening on port 20130 (Telegram Ingress)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":20130" ^| findstr "LISTENING"') do (
    echo Terminating Telegram Ingress daemon PID %%a on port 20130...
    taskkill /F /PID %%a >nul 2>&1
)

REM 7. Terminate processes listening on port 20129 (Audio)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":20129" ^| findstr "LISTENING"') do (
    echo Terminating Audio daemon PID %%a on port 20129...
    taskkill /F /PID %%a >nul 2>&1
)

REM 8. Terminate lingering python daemon processes if running
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*watchdog.py*' -or $_.CommandLine -like '*audio_daemon.py*' -or $_.CommandLine -like '*telegram_daemon.py*' -or $_.CommandLine -like '*event_worker.py*' -or $_.CommandLine -like '*cortex_daemon.py*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo ===================================================
echo [FAUST C2] All Sovereign Daemons and Watchdogs Stopped Cleanly.
echo ===================================================
