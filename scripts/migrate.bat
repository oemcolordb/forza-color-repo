@echo off
REM Turso Database Migration Runner for Windows

echo 🚀 Running Turso database migration...
echo.

REM Check if turso CLI is installed
where turso >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Turso CLI not found. Install it first:
    echo    irm https://get.tur.so/install.ps1 ^| iex
    exit /b 1
)

REM Get database name from environment or use default
if "%TURSO_DB_NAME%"=="" (
    set DB_NAME=forza-color-repo
) else (
    set DB_NAME=%TURSO_DB_NAME%
)

echo 📊 Database: %DB_NAME%
echo.

REM Run migration
turso db shell %DB_NAME% < migrations\001_create_scans_table.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Migration completed successfully!
    echo.
    echo Verifying tables...
    turso db shell %DB_NAME% "SELECT name FROM sqlite_master WHERE type='table';"
) else (
    echo.
    echo ❌ Migration failed. Check your database connection.
    exit /b 1
)
