/**
 * Script to download a file from Google Drive using its File ID.
 * Usage: node scripts/gdrive-download.js <FILE_ID>
 */

const { google } = require('googleapis')
const fs = require('fs')
const path = require('path')

// 1. Load env vars from .env.local safely
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

async function downloadFile(drive, fileId, providedName = null) {
  try {
    let fileName = providedName
    if (!fileName) {
      // First, fetch the file metadata to find out its original name
      console.log(`\n🔍 Fetching metadata for file ID: ${fileId}...`)
      const metaRes = await drive.files.get({
        fileId: fileId,
        fields: 'name',
      })
      fileName = metaRes.data.name
    }

    console.log(`\n📄 Preparing to download: "${fileName}"`)

    // Set the destination path (saving it straight to the root of your project)
    const destPath = path.join(__dirname, '..', fileName)
    const destStream = fs.createWriteStream(destPath)

    // Download the actual file contents as a stream
    console.log(`⬇️ Downloading contents...`)
    const res = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    )

    return new Promise((resolve, reject) => {
      res.data
        .on('end', () => {
          console.log(`✅ Successfully downloaded to: ${destPath}`)
          resolve(destPath)
        })
        .on('error', err => {
          console.error('❌ Error downloading file.', err)
          reject(err)
        })
        .pipe(destStream)
    })
  } catch (err) {
    console.error('\n❌ Google Drive API Error:', err.message)
  }
}

async function main() {
  const auth = new google.auth.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/drive.readonly'] })
  const drive = google.drive({ version: 'v3', auth })

  const fileId = process.argv[2]

  if (fileId) {
    // If an ID is provided, just download that one file
    await downloadFile(drive, fileId)
  } else {
    // If no ID is provided, automatically download everything!
    console.log("📡 Fetching list of all shared files...")
    try {
      const res = await drive.files.list({
        pageSize: 100,
        fields: 'files(id, name)',
        q: "trashed=false and mimeType != 'application/vnd.google-apps.folder'" // Skip folders
      })
      const files = res.data.files
      if (!files || files.length === 0) {
        console.log('\n📭 No files found.')
        return
      }
      console.log(`\n📥 Found ${files.length} files. Starting batch download...`)
      for (const file of files) {
        await downloadFile(drive, file.id, file.name)
      }
      console.log('\n🎉 All files downloaded successfully!')
    } catch (err) {
      console.error('\n❌ Error fetching file list:', err.message)
    }
  }
}

main()
