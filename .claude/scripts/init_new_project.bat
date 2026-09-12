@echo off
setlocal
REM ==============================================================================
REM Faust Sovereign Project Initializer & Manifest-Driven Memory Slicer
REM Usage:
REM   init_new_project.bat "<TargetDir>" "<ProjectName>" "<DomainTags>" "<BlueprintFile>"
REM Examples:
REM   init_new_project.bat "D:\My Drive\Universe 25" "Universe 25" "ui"
REM   init_new_project.bat "D:\My Drive\Blue AI\backend" "BlueRoseBackend" "backend"
REM   init_new_project.bat "D:\My Drive\Golden Hour" "GoldenHour" "game" "golden_hour_bp.md"
REM ==============================================================================

python "%~dp0init_new_project.py" %*
pause
