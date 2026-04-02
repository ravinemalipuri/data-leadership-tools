@echo off
cd /d "%~dp0"
npm install
echo.
echo Starting RAID Log frontend on http://localhost:3002
echo.
npm run dev
