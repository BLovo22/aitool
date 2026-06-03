@echo off
REM ============================================
REM  AIToolKit ? Local Update Script (Windows)
REM  Run: scripts\update.bat
REM ============================================
echo ?? AIToolKit ? Manual Data Update
echo =================================
echo.

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ? Node.js is required but not found.
    echo    Install from: https://nodejs.org
    exit /b 1
)

echo ?? Running update script...
node scripts\update-manual.mjs

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ? Update complete! Check js\data.js for changes.
    echo    To preview: open index.html in your browser.
) else (
    echo.
    echo ? Update failed. Check the error messages above.
)

pause
