@echo off
setlocal
title Faust Workflow Engine & Web-OS Dashboard (Mock Beta)

echo =====================================================================
echo              FAUST AUTONOMOUS WORKFLOW ENGINE (MOCK BETA)
echo =====================================================================
echo.

set PYTHON_EXE=python
set WORKFLOW_FILE=%~dp0workflows\telegram_c2_pipeline.json
set ENGINE_SCRIPT=%~dp0scripts\workflow_engine.py
set DASHBOARD_URL=http://localhost:20138

echo [1/2] Launching Web-OS DAG Dashboard at %DASHBOARD_URL%...
start "" "%DASHBOARD_URL%"

echo [2/2] Starting Faust Terminal Worker (Port 20138 + Telegram C2)...
%PYTHON_EXE% "%ENGINE_SCRIPT%" --workflow "%WORKFLOW_FILE%" --listen --port 20138 --interval 2.0

echo.
echo Worker shutdown complete.
pause
