/**
 * Master automation script: Download PDFs → Extract Tunes → Seed DB → Backup
 * Usage: node scripts/automate-tune-pipeline.js
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const SCRIPTS_DIR = __dirname
const ROOT_DIR = path.join(SCRIPTS_DIR, '..')

function runCommand(cmd, description) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🚀 ${description}`)
  console.log(`${'='.repeat(60)}`)
  
  try {
    execSync(cmd, { 
      cwd: ROOT_DIR, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    })
    return true
  } catch (err) {
    console.error(`❌ Failed: ${description}`)
    console.error(err.message)
    return false
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║     Forza Color - Automated Tune Pipeline                ║')
  console.log('║     Download → Extract → Seed → Backup                   ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  
  const startTime = Date.now()
  let stepsCompleted = 0
  const totalSteps = 4
  
  // Step 1: Download PDFs from Google Drive
  console.log(`\n📋 STEP 1/${totalSteps}: Download tune PDFs from Google Drive`)
  if (runCommand('node scripts/gdrive-download-all-pdfs.js', 'Downloading PDFs from Google Drive')) {
    stepsCompleted++
  }
  
  // Step 2: Extract tunes from PDFs
  console.log(`\n📋 STEP 2/${totalSteps}: Extract tunes from downloaded PDFs`)
  const researchFolder = path.join(ROOT_DIR, 'Forza-color-repo Research')
  if (fs.existsSync(researchFolder)) {
    // Check if pdfplumber is available, otherwise use basic extraction
    try {
      execSync('python -c "import pdfplumber"', { stdio: 'ignore' })
      if (runCommand(`python scripts/extract_tunes_v2.py "${researchFolder}"`, 'Extracting tunes with pdfplumber')) {
        stepsCompleted++
      }
    } catch {
      console.log('⚠️  pdfplumber not available, using fallback extraction')
      if (runCommand(`python scripts/extract_raw_tunes.py "${researchFolder}"`, 'Extracting raw tune data')) {
        stepsCompleted++
      }
    }
  } else {
    console.log('⚠️  Research folder not found, skipping extraction')
  }
  
  // Step 3: Seed database
  console.log(`\n📋 STEP 3/${totalSteps}: Seed database with extracted tunes`)
  const cleanedTunesPath = path.join(SCRIPTS_DIR, 'cleaned_tunes.json')
  const extractedTunesPath = path.join(SCRIPTS_DIR, 'extracted_tunes.json')
  
  if (fs.existsSync(cleanedTunesPath)) {
    if (runCommand('node scripts/seed-community-tunes.js', 'Seeding database with cleaned tunes')) {
      stepsCompleted++
    }
  } else if (fs.existsSync(extractedTunesPath)) {
    if (runCommand('node scripts/seed-community-tunes.js', 'Seeding database with extracted tunes')) {
      stepsCompleted++
    }
  } else {
    console.log('⚠️  No tune files found to seed')
  }
  
  // Step 4: Backup to Google Drive
  console.log(`\n📋 STEP 4/${totalSteps}: Backup data to Google Drive`)
  if (runCommand('node scripts/gdrive-backup.js', 'Backing up data to Google Drive')) {
    stepsCompleted++
  }
  
  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\n${'='.repeat(60)}`)
  console.log('📊 PIPELINE COMPLETE')
  console.log(`${'='.repeat(60)}`)
  console.log(`✅ Steps completed: ${stepsCompleted}/${totalSteps}`)
  console.log(`⏱️  Duration: ${duration}s`)
  
  if (stepsCompleted === totalSteps) {
    console.log('\n🎉 All steps completed successfully!')
  } else {
    console.log('\n⚠️  Some steps failed. Check logs above.')
    process.exit(1)
  }
}

main().catch(err => {
  console.error('❌ Pipeline failed:', err.message)
  process.exit(1)
})
