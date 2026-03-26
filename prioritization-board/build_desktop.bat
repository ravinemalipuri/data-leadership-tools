@echo off
setlocal EnableDelayedExpansion

echo ============================================================
echo  Data ^& Analytics Prioritization Board — Desktop Build
echo ============================================================
echo.

:: ── 1. Build the React frontend ─────────────────────────────
echo [1/4] Building frontend...
cd /d "%~dp0frontend"
call npm install --silent
if errorlevel 1 ( echo ERROR: npm install failed & pause & exit /b 1 )
call npm run build
if errorlevel 1 ( echo ERROR: npm build failed & pause & exit /b 1 )
cd /d "%~dp0"
echo       Done.
echo.

:: ── 2. Copy the build output to backend/static ──────────────
echo [2/4] Copying frontend build to backend\static...
if exist "%~dp0backend\static" rmdir /s /q "%~dp0backend\static"
xcopy /E /I /Q "%~dp0frontend\dist" "%~dp0backend\static"
if errorlevel 1 ( echo ERROR: xcopy failed & pause & exit /b 1 )
echo       Done.
echo.

:: ── 3. Install Python dependencies ──────────────────────────
echo [3/4] Installing Python dependencies...
cd /d "%~dp0backend"
call venv\Scripts\activate.bat
pip install aiosqlite pyinstaller --quiet
if errorlevel 1 ( echo ERROR: pip install failed & pause & exit /b 1 )
echo       Done.
echo.

:: ── 4. Build the executable ─────────────────────────────────
echo [4/4] Building executable with PyInstaller...
pyinstaller board.spec --noconfirm
if errorlevel 1 ( echo ERROR: PyInstaller failed & pause & exit /b 1 )
echo       Done.
echo.

echo ============================================================
echo  Build complete!
echo  Executable: backend\dist\PrioritizationBoard.exe
echo  Share that single file — no install required.
echo ============================================================
echo.
pause
