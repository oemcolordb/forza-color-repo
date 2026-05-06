/**
 * Create test user account
 * Usage: node scripts/create-test-user.js
 */

const { createClient } = require('@libsql/client')
const { randomUUID, randomBytes, scryptSync } = require('crypto')
const fs = require('fs')
const path = require('path')

// Zero-dependency secure password hashing using Node's built-in crypto
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derivedKey}`
}

function makeClient() {
  const url = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN || ''

  if (url && url !== 'your_turso_database_url_here' && url !== 'your_turso_database_url') {
    return createClient({ url, authToken: token })
  }

  // Local SQLite fallback
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

  return createClient({ url: 'file:./data/local.db' })
}

async function createTestUser() {
  const db = makeClient()

  const email = 'testaccount1@test.com'
  const password = 'default123'
  const name = 'Test Account 1'

  try {
    // Create users table if not exists
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id           TEXT    PRIMARY KEY,
        email        TEXT    NOT NULL UNIQUE,
        password     TEXT    NOT NULL,
        name         TEXT,
        role         TEXT    DEFAULT 'user',
        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Check if user already exists
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email],
    })

    if (existing.rows.length > 0) {
      console.log(`User ${email} already exists.`)
      return
    }

    // Create user
    const id = randomUUID()
    const hashedPassword = hashPassword(password)

    await db.execute({
      sql: 'INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)',
      args: [id, email, hashedPassword, name],
    })

    console.log('✅ Test user created successfully!')
    console.log('')
    console.log('Login credentials:')
    console.log(`  Email:    ${email}`)
    console.log(`  Password: ${password}`)
    console.log(`  Name:     ${name}`)
    console.log(`  User ID:  ${id}`)
  } catch (error) {
    console.error('❌ Error creating test user:', error.message)
    process.exit(1)
  }
}

createTestUser()
