:: D:\My Drive\Blue AI\Rebased\Rebased.bat
@echo off
setlocal EnableDelayedExpansion

echo ==========================================
echo   Faust Rebased Launcher (Background)
echo ==========================================

REM --- Resolve root as the folder containing this .bat file ---
set "ROOT=%~dp0"
if "!ROOT:~-1!" == "\" set "ROOT=!ROOT:~0,-1!"

set "PID_DIR=%TEMP%\FaustRebased"
set "BACKEND_DIR=!ROOT!\backend"
set "FRONTEND_DIR=!ROOT!\frontend"

set "BACKEND_PORT=8081"
set "FRONTEND_PORT=5174"

REM --- Executable configuration (replace with full paths if not in PATH) ---
set "PYTHON_EXE=python"

if not exist "%PID_DIR%" mkdir "%PID_DIR%"

REM ==========================================================
REM 1. Terminate previous Backend process tree
REM ==========================================================
if exist "%PID_DIR%\backend.pid" (
    for /f "usebackq delims=" %%i in ("%PID_DIR%\backend.pid") do taskkill /PID %%i /T /F >nul 2>&1
    del "%PID_DIR%\backend.pid" >nul 2>&1
)

REM ==========================================================
REM 2. Terminate previous Frontend process tree
REM ==========================================================
if exist "%PID_DIR%\frontend.pid" (
    for /f "usebackq delims=" %%i in ("%PID_DIR%\frontend.pid") do taskkill /PID %%i /T /F >nul 2>&1
    del "%PID_DIR%\frontend.pid" >nul 2>&1
)

REM ==========================================================
REM 3. Port Clear Sweep
REM ==========================================================
powershell -NoProfile -Command "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in %BACKEND_PORT%, %FRONTEND_PORT% } | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

ping 127.0.0.1 -n 2 >nul

REM ==========================================================
REM 4. First-run setup (only if needed)
REM ==========================================================
if not exist "!FRONTEND_DIR!\node_modules" (
    echo Installing frontend dependencies...
    pushd "!FRONTEND_DIR!"
    call npm install
    popd
)

if not exist "!ROOT!\data\rebased.db" (
    echo Seeding database...
    pushd "!ROOT!"
    "%PYTHON_EXE%" scripts\ingest_core.py
    popd
)

REM ==========================================================
REM 5. Launch Backend (headless)
REM ==========================================================
powershell -NoProfile -Command "$p = Start-Process -FilePath '%PYTHON_EXE%' -WorkingDirectory '!BACKEND_DIR!' -ArgumentList '-m','uvicorn','main:app','--host','0.0.0.0','--port','%BACKEND_PORT%','--reload' -WindowStyle Hidden -PassThru -RedirectStandardOutput '%PID_DIR%\backend.log' -RedirectStandardError '%PID_DIR%\backend_err.log'; if ($p) { [System.IO.File]::WriteAllText('%PID_DIR%\backend.pid', $p.Id.ToString()) }"

REM ==========================================================
REM 6. Launch Frontend (headless)
REM ==========================================================
powershell -NoProfile -Command "$p = Start-Process -FilePath 'cmd.exe' -WorkingDirectory '!FRONTEND_DIR!' -ArgumentList '/c npx vite --host 0.0.0.0 --port %FRONTEND_PORT%' -WindowStyle Hidden -PassThru -RedirectStandardOutput '%PID_DIR%\frontend.log' -RedirectStandardError '%PID_DIR%\frontend_err.log'; if ($p) { [System.IO.File]::WriteAllText('%PID_DIR%\frontend.pid', $p.Id.ToString()) }"

echo.
echo Initializing headless services (waiting for port binding)...
ping 127.0.0.1 -n 4 >nul

echo ==========================================
echo   Status: Active Headless Services
echo ==========================================
echo Backend  : http://localhost:%BACKEND_PORT%  (Log: %PID_DIR%\backend.log)
echo Frontend : http://localhost:%FRONTEND_PORT%  (Log: %PID_DIR%\frontend.log)
echo ==========================================
