@echo off
setlocal
cd /d "%~dp0"

echo ========================================
echo   SportLog - Windows Launcher
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not installed or is not in PATH.
  echo Install Node.js 18 or newer, then run this file again.
  pause
  exit /b 1
)

if not exist package.json (
  echo ERROR: package.json was not found.
  echo Please run this launcher from the SportLog repository root.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo ERROR: npm install failed.
    pause
    exit /b 1
  )
)

echo.
echo Starting SportLog...
echo Open http://localhost:3000 in your browser.
echo Keep this window open while using the application.
echo.
call npm.cmd start

if errorlevel 1 (
  echo.
  echo SportLog stopped with an error.
  pause
)
endlocal
