@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo  Forza Horizon 5 Telemetry Bridge - Setup ^& Launch
echo ============================================================
echo.

:: ── 1. Check for Node.js ─────────────────────────────────────
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Node.js is not installed or not in PATH.
    echo     Attempting to install via Windows Package Manager (winget)...
    echo.
    winget install --id OpenJS.NodeJS.LTS --source winget --accept-package-agreements --accept-source-agreements
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [!] winget install failed. Please install Node.js manually:
        echo     https://nodejs.org/en/download
        echo.
        echo     After installing, re-run this file.
        pause
        exit /b 1
    )
    echo.
    echo [+] Node.js installed. Refreshing PATH...
    :: Reload PATH so node is available in this session
    for /f "tokens=*" %%i in ('powershell -NoProfile -Command "[System.Environment]::GetEnvironmentVariable(\"PATH\",\"Machine\")"') do set "PATH=%%i;%PATH%"
)

for /f "tokens=*" %%v in ('node --version 2^>nul') do set NODE_VER=%%v
echo [+] Node.js found: %NODE_VER%
echo.

:: ── 2. Install npm dependencies if node_modules is missing ────
if not exist "%~dp0node_modules\" (
    echo [*] node_modules not found. Running npm install...
    echo     (This only happens once and may take a minute.)
    echo.
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [!] npm install failed. Check the errors above.
        pause
        exit /b 1
    )
    echo.
    echo [+] Dependencies installed.
    echo.
) else (
    echo [+] Dependencies already installed.
    echo.
)

:: ── 3. Start the telemetry bridge ─────────────────────────────
echo [*] Starting Forza Horizon 5 Telemetry Bridge...
echo     UDP Port  : 5300  (must match Forza "Data Out IP Port")
echo     WebSocket : 8080  (browser connects here)
echo.
echo     Keep this window open while playing.
echo     Close it to stop the bridge.
echo.
node "%~dp0server.js"
pause
