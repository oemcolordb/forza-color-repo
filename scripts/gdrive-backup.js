/**
 * Backup extracted tunes and research data to Google Drive.
 * Usage: node scripts/gdrive-backup.js
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

const BACKUP_FOLDER_NAME = 'Forza-Color-Backups'

async function findOrCreateBackupFolder(drive) {
  // Search for existing backup folder
  const searchRes = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${BACKUP_FOLDER_NAME}' and trashed=false`,
    fields: 'files(id, name)'
  })

  if (searchRes.data.files.length > 0) {
    console.log(`📁 Found existing backup folder: ${searchRes.data.files[0].id}`)
    return searchRes.data.files[0].id
  }

  // Create new folder
  const createRes = await drive.files.create({
    requestBody: {
      name: BACKUP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder'
    },
    fields: 'id'
  })

  console.log(`📁 Created backup folder: ${createRes.data.id}`)
  return createRes.data.id
}

async function uploadFile(drive, folderId, filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  File not found: ${fileName}`)
    return null
  }

  // Check if file already exists in Drive
  const searchRes = await drive.files.list({
    q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
    fields: 'files(id, modifiedTime)'
  })

  const fileSize = fs.statSync(filePath).size
  const fileStream = fs.createReadStream(filePath)

  if (searchRes.data.files.length > 0) {
    // Update existing file
    const fileId = searchRes.data.files[0].id
    console.log(`🔄 Updating: ${fileName}`)

    await drive.files.update({
      fileId: fileId,
      media: {
        body: fileStream
      }
    })
    console.log(`✅ Updated: ${fileName}`)
    return fileId
  } else {
    // Upload new file
    console.log(`⬆️  Uploading: ${fileName}`)

    const createRes = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId]
      },
      media: {
        body: fileStream
      },
      fields: 'id'
    })
    console.log(`✅ Uploaded: ${fileName}`)
    return createRes.data.id
  }
}

async function main() {
  console.log('🔐 Authenticating with Google Drive...')
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive']
  })
  const drive = google.drive({ version: 'v3', auth })

  console.log('📁 Finding or creating backup folder...')
  const folderId = await findOrCreateBackupFolder(drive)

  const filesToBackup = [
    { path: path.join(__dirname, 'extracted_tunes.json'), name: `extracted_tunes_${new Date().toISOString().split('T')[0]}.json` },
    { path: path.join(__dirname, 'raw_extracted_data.json'), name: `raw_extracted_data_${new Date().toISOString().split('T')[0]}.json` },
    { path: path.join(__dirname, 'cleaned_tunes.json'), name: `cleaned_tunes_${new Date().toISOString().split('T')[0]}.json` },
    { path: path.join(__dirname, '..', 'data', 'cars.json'), name: 'cars_backup.json' }
  ]

  console.log(`\n📤 Backing up ${filesToBackup.length} files...\n`)

  let uploaded = 0
  for (const file of filesToBackup) {
    const result = await uploadFile(drive, folderId, file.path, file.name)
    if (result) uploaded++
  }

  console.log(`\n✅ Backup complete! Uploaded/updated: ${uploaded} files`)
  console.log(`📂 Backup folder: https://drive.google.com/drive/folders/${folderId}`)
}

main().catch(err => {
  if (err.message.includes('storage quota') || err.message.includes('Service Accounts do not have storage')) {
    console.warn('⚠️  Backup skipped: Service account storage quota exceeded')
    console.log('💡 To enable backups:')
    console.log('   1. Enable billing on the Google Cloud project')
    console.log('   2. Or switch to OAuth-based authentication')
    console.log('   3. Or manually share files to a personal Google Drive')
    process.exit(0)  // Don't fail the pipeline
  } else {
    console.error('❌ Backup failed:', err.message)
    process.exit(1)
  }
})
