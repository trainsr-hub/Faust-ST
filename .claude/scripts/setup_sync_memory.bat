@echo off
echo =======================================================
echo Setting up Faust Shared Memory & Multi-Device Sync
echo =======================================================
powershell -ExecutionPolicy RemoteSigned -File "%~dp0setup_sync_memory.ps1"
pause
