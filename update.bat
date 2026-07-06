@echo off
cd /d "%~dp0"
git add .
git commit -m "Add Netlify functions + redirect config"
git push origin main
echo Done!
pause
