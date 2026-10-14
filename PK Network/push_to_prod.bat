@echo off
title PK Network - Push to Production
cd /d "%~dp0"
cls

echo ===================================================
echo     PK NETWORK - HUMBLE PRODUCTION DEPLOYER
echo ===================================================
echo.
echo [1/4] Building optimized production bundle...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed! Aborting deployment.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Deploying to Cloudflare Workers Edge...
call npx wrangler deploy
if %errorlevel% neq 0 (
    echo [ERROR] Cloudflare deploy failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Syncing repository with GitHub...
git add -A
git commit -m "deploy(prod): production release build %date% %time%"
git push origin main

echo.
echo [4/4] Announcing via Faust Acoustic Core...
python "..\.claude\skills\sound\scripts\cli.py" "Manager, production deployment and GitHub push are complete. The latest build is live."

echo.
echo ===================================================
echo   PRODUCTION DEPLOYMENT SUCCESSFUL!
echo   Live URL: https://pk-network.kha70929.workers.dev
echo ===================================================
echo.
pause
