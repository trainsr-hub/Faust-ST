@echo off
REM Faust Sovereign Workspace Launcher
REM Opens VS Code workspace into D:\My Drive\Blue AI

set "WORKSPACE_ROOT=d:\My Drive\Blue AI"
cd /d "%WORKSPACE_ROOT%"

echo.
echo ============================================================
echo   FAUST WORKSPACE LAUNCHER
echo ============================================================
echo.

echo Launching VS Code Workspace...
start "" "code" "%WORKSPACE_ROOT%"

echo.
echo ============================================================
echo   FAUST WORKSPACE OPENED
echo ============================================================
echo.
timeout /t 1 > nul
exit
