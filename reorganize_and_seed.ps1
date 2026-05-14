# -------------------------------------------------
# Forza Color Repo - Tree Reorganization & Data Seeding
# -------------------------------------------------
Write-Host "Starting Repository Reorganization..." -ForegroundColor Cyan

# 1. Consolidate 'src/lib' and 'src/types' into 'app'
Write-Host "Consolidating lib and types directories..."
if (Test-Path "src/lib") {
    Copy-Item -Path "src/lib\*" -Destination "app/lib" -Recurse -Force
}
if (Test-Path "src/types") {
    Copy-Item -Path "src/types\*" -Destination "app/types" -Recurse -Force
}

# 2. Remove the now-empty 'src' and redundant root 'lib' and 'services'
Write-Host "Cleaning up redundant folders..."
Remove-Item -Path "src" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "lib" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "services" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Clean up the messy 'scripts' folder (archive old extractors)
Write-Host "Archiving old python extraction scripts..."
$archiveDir = "scripts/archive"
if (-not (Test-Path $archiveDir)) { New-Item -ItemType Directory -Path $archiveDir | Out-Null }
Move-Item -Path "scripts/extract_tunes_*.py" -Destination $archiveDir -Force -ErrorAction SilentlyContinue
Move-Item -Path "scripts/extract_colors_*.py" -Destination $archiveDir -Force -ErrorAction SilentlyContinue

# 4. Integrate missed Colors
Write-Host "Merging extracted colors into carColors.json..." -ForegroundColor Green
# This runs the built-in script to safely merge extracted_colors.json into public/carColors.json
node scripts/merge_autocolor_strict.js

# 5. Integrate missed Tunes
Write-Host "Seeding Community Tunes into the Database..." -ForegroundColor Green
# This uploads tunes-extracted.json to your Turso DB for the TuneForge page
node scripts/seed-community-tunes.js

Write-Host "Reorganization & Seeding Complete!" -ForegroundColor Cyan
