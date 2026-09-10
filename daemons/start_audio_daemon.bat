@echo off
title Faust Resident Audio Daemon (Port 20129)
cd /d "%~dp0\.."
echo [FAUST C2] Initializing Faust Resident Audio Daemon...
python daemons/audio_daemon.py
pause
