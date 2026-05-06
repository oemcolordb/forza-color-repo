/**
 * Test script to verify Google Drive authentication and list shared files.
 * Run: node scripts/gdrive-test.js
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
    // Force overwrite to guarantee .env.local is always prioritized
    if (key) process.env[key] = val
  }
}

async function main() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error("❌ GOOGLE_APPLICATION_CREDENTIALS not found in .env.local")
    process.exit(1)
  }

  console.log(`[DEBUG] Trying to load key from: "${process.env.GOOGLE_APPLICATION_CREDENTIALS}"`)

  console.log("🔐 Authenticating with Google Drive...")
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })

  const drive = google.drive({ version: 'v3', auth })

  try {
    console.log("📡 Fetching shared files...")
    const res = await drive.files.list({
      pageSize: 20,
      fields: 'files(id, name, mimeType)',
      q: "trashed=false" // Only get active files
    })

    const files = res.data.files
    if (!files || files.length === 0) {
      console.log('\n📭 No files found. Double-check that they were shared to the exact client_email address!')
      return
    }

    console.log('\n✅ Successfully found your shared files:')
    console.table(files)
  } catch (err) {
    console.error('\n❌ Google Drive API Error:', err.message)
  }
}

main()
