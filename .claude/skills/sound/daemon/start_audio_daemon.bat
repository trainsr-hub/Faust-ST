@echo off
title Faust Resident Audio Daemon (Port 20129)
cd /d "%~dp0"
echo [FAUST C2] Initializing Faust Resident Audio Daemon on Port 20129...
python audio_daemon.py
pause
