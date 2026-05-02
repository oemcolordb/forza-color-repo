const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')

// Simple file-based user store (use database in production)
const fs = require('fs')
const path = require('path')

const USERS_FILE = path.join('/tmp', 'forza-users.json')
const JWT_SECRET = process.env.JWT_SECRET || 'forza-colors-secret-key-change-in-production'

// Load users from file
function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading users:', error)
  }
  return {}
}

// Save users to file
function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
  } catch (error) {
    console.error('Error saving users:', error)
  }
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const { email, password, name } = JSON.parse(event.body)

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Email and password required' }),
      }
    }

    if (password.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Password must be at least 8 characters' }),
      }
    }

    const users = loadUsers()
    const emailLower = email.toLowerCase()

    if (users[emailLower]) {
      return { statusCode: 409, headers, body: JSON.stringify({ message: 'User already exists' }) }
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const userId = uuidv4()

    const user = {
      id: userId,
      email: emailLower,
      name: name || email.split('@')[0],
      passwordHash,
      role: 'user',
      createdAt: new Date().toISOString(),
    }

    users[emailLower] = user
    saveUsers(users)

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
      },
      JWT_SECRET
    )

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      }),
    }
  } catch (error) {
    console.error('Signup error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
}
