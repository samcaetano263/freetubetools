@echo off
cd /d "%~dp0"
echo Resetting git history and pushing clean...
echo.

REM Remove old git folder completely
if exist ".git" (
    rd /s /q ".git"
    echo Old git history deleted.
)

REM Fresh init
git init
git branch -M main
git remote add origin https://github.com/samcaetano263/freetubetools.git

REM Stage everything (secrets excluded by .gitignore)
git add .
git status

REM Commit
git commit -m "FreeTubeTools - initial launch"

REM Push
echo.
echo Pushing to GitHub...
git push -u origin main --force

echo.
if errorlevel 1 (
    echo FAILED - see error above
) else (
    echo SUCCESS! Code is on GitHub.
)
pause
