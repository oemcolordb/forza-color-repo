/**
 * Download ALL PDF files shared with the service account to the Research folder.
 * Usage: node scripts/gdrive-download-all-pdfs.js
 */

const { google } = require('googleapis')
const fs = require('fs')
const path = require('path')

// Load env vars from .env.local
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (key) process.env[key] = val
  }
}

const RESEARCH_FOLDER = path.join(__dirname, '..', 'Forza-color-repo Research')

// Ensure research folder exists
if (!fs.existsSync(RESEARCH_FOLDER)) {
  fs.mkdirSync(RESEARCH_FOLDER, { recursive: true })
  console.log(`📁 Created folder: ${RESEARCH_FOLDER}`)
}

async function downloadFile(drive, fileId, fileName) {
  const destPath = path.join(RESEARCH_FOLDER, fileName)
  
  // Skip if already exists
  if (fs.existsSync(destPath)) {
    console.log(`⏭️  Skipping (exists): ${fileName}`)
    return destPath
  }
  
  const destStream = fs.createWriteStream(destPath)
  
  try {
    const res = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    )
    
    return new Promise((resolve, reject) => {
      res.data
        .on('end', () => {
          console.log(`✅ Downloaded: ${fileName}`)
          resolve(destPath)
        })
        .on('error', err => {
          console.error(`❌ Error downloading ${fileName}:`, err.message)
          reject(err)
        })
        .pipe(destStream)
    })
  } catch (err) {
    console.error(`❌ Failed to download ${fileName}:`, err.message)
  }
}

async function main() {
  console.log('🔐 Authenticating with Google Drive...')
  const auth = new google.auth.GoogleAuth({ 
    scopes: ['https://www.googleapis.com/auth/drive.readonly'] 
  })
  const drive = google.drive({ version: 'v3', auth })

  console.log('📡 Fetching all PDF files shared with service account...')
  
  try {
    // Query for PDF files only
    const res = await drive.files.list({
      pageSize: 100,
      fields: 'files(id, name, mimeType, modifiedTime)',
      q: "mimeType='application/pdf' and trashed=false",
      orderBy: 'modifiedTime desc'
    })
    
    const files = res.data.files
    if (!files || files.length === 0) {
      console.log('\n📭 No PDF files found.')
      console.log('💡 Make sure you\'ve shared PDFs with the service account email.')
      return
    }
    
    console.log(`\n📄 Found ${files.length} PDF files`)
    console.log(`📁 Downloading to: ${RESEARCH_FOLDER}\n`)
    
    let downloaded = 0
    let skipped = 0
    
    for (const file of files) {
      const destPath = path.join(RESEARCH_FOLDER, file.name)
      if (fs.existsSync(destPath)) {
        console.log(`⏭️  [${downloaded + skipped + 1}/${files.length}] Skipping: ${file.name}`)
        skipped++
      } else {
        console.log(`⬇️  [${downloaded + skipped + 1}/${files.length}] Downloading: ${file.name}`)
        await downloadFile(drive, file.id, file.name)
        downloaded++
      }
    }
    
    console.log(`\n✅ Done! Downloaded: ${downloaded}, Skipped: ${skipped}, Total: ${files.length}`)
    
  } catch (err) {
    console.error('\n❌ Error:', err.message)
    process.exit(1)
  }
}

main()
