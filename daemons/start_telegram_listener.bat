@echo off
REM Start Faust Telegram Smart Listener in background with no console window
cd /d "%~dp0"
REM Use pythonw.exe to hide console window; fallback to python if pythonw not found
where pythonw >nul 2>&1
if %errorlevel%==0 (
    pythonw telegram_smart_listener.py
) else (
    python telegram_smart_listener.py
)