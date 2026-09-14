@echo off
setlocal
title Faust Event-Driven Telegram Worker (Golden Standard)

echo =====================================================================
echo         FAUST EVENT-DRIVEN TELEGRAM WORKER (PORT 20130)
echo =====================================================================
echo.

set PYTHON_EXE=python
set WORKER_SCRIPT=%~dp0scripts\event_worker.py

%PYTHON_EXE% "%WORKER_SCRIPT%" --interval 1.5

echo.
echo Worker shutdown complete.
pause
