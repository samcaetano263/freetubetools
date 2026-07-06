@echo off
cd /d "%~dp0"

REM Kill lock
if exist ".git\index.lock" del /f /q ".git\index.lock"

REM Stage everything
git add .
git status

REM Commit
git commit -m "Initial commit - FreeTubeTools"

REM Push
echo.
echo Pushing to GitHub...
git push -u origin main 2>&1

echo.
if errorlevel 1 (
    echo FAILED - see above
) else (
    echo SUCCESS!
)
pause
