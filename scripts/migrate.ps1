# Turso Database Migration Runner for PowerShell

Write-Host "🚀 Running Turso database migration..." -ForegroundColor Cyan
Write-Host ""

# Check if turso CLI is installed
if (-not (Get-Command turso -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Turso CLI not found. Install it first:" -ForegroundColor Red
    Write-Host "   irm https://get.tur.so/install.ps1 | iex" -ForegroundColor Yellow
    exit 1
}

# Get database name from environment or use default
$DB_NAME = if ($env:TURSO_DB_NAME) { $env:TURSO_DB_NAME } else { "forza-color-repo" }

Write-Host "📊 Database: $DB_NAME" -ForegroundColor Green
Write-Host ""

# Run migration
Get-Content migrations\001_create_scans_table.sql | turso db shell $DB_NAME

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verifying tables..." -ForegroundColor Cyan
    turso db shell $DB_NAME "SELECT name FROM sqlite_master WHERE type='table';"
} else {
    Write-Host ""
    Write-Host "❌ Migration failed. Check your database connection." -ForegroundColor Red
    exit 1
}
