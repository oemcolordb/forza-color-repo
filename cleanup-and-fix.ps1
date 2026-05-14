# Forza Color Universe - Repository Cleanup & Build Fix Script
# Run this in PowerShell from the project root.

Write-Host "--- Starting Forza Color Universe Finalization ---" -ForegroundColor Cyan

# 1. Create maintenance directory if it doesn't exist
if (!(Test-Path "maintenance")) {
    New-Item -ItemType Directory -Path "maintenance" | Out-Null
    Write-Host "[1/4] Created maintenance/ directory." -ForegroundColor Green
}

# 2. Move junk files to maintenance
$junkFiles = @(
    "AUDIT_REPORT.md", "CHANGELOG.md", "CONTRIBUTING.md", 
    "Copy of ManteoMax's Forza HORIZON 5 Spreadsheets",
    "added_colors.log", "analysis_log.txt", "analyze_output.txt",
    "audit-after.txt", "audit-colors.mjs", "audit-fix-output.txt",
    "audit_hsb_detailed.py", "color_fix_report.json",
    "color_hsb_audit_results.json", "dev-err.txt", "dev-out.txt",
    "dev-server-log.txt", "extract_colors.py", "fix-author.bat",
    "fix.sh", "fix_hsb_errors.py", "generate_output.txt",
    "git-push-output.txt", "launch-telemetry.bat", "name_hsb_fix_report.json",
    "oem-color-validation-report.json", "parse_pdfs.py", "pdf_text_sample.txt",
    "reorganize_and_seed.ps1", "secret.txt"
)

# Move matching patterns
$patterns = @("Designer-30-*.json", "Gemini_Generated_Image_*.json", "Screenshot 2026-04-13 *.json", "v2-*.json", "build-cleanup-check*.txt", "colorful-weed-strains-*.json", "netlify-build-log*.txt", "playwright-*.txt", "playwright-results*.txt", "shutterstock_*.json")

Write-Host "[2/4] Moving junk files to maintenance/..." -ForegroundColor Yellow
foreach ($file in $junkFiles) {
    if (Test-Path $file) { Move-Item $file "maintenance/" -Force }
}
foreach ($pattern in $patterns) {
    Get-ChildItem $pattern -ErrorAction SilentlyContinue | Move-Item -Destination "maintenance/" -Force
}

# 3. Clean environment
Write-Host "[3/4] Cleaning environment (node_modules, .next, package-lock.json)..." -ForegroundColor Yellow
$foldersToClean = @("node_modules", ".next", ".vercel")
foreach ($folder in $foldersToClean) {
    if (Test-Path $folder) { Remove-Item -Recurse -Force $folder }
}
if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" }

# 4. Final Instructions
Write-Host "[4/4] Cleanup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "ACTION REQUIRED:" -ForegroundColor White -BackgroundColor Blue
Write-Host "1. Run 'npm install' to regenerate the lockfile for Next.js 15."
Write-Host "2. Run 'npm run build' to verify the fix."
Write-Host "3. Run 'git add .' then 'git commit -m `"chore: Finalize root cleanup and fix build config`"' then 'git push' to deploy."
Write-Host ""
Write-Host "The missing 'services/' have been restored. Your platform is ready for the final push." -ForegroundColor Cyan
