const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const { email, password } = JSON.parse(event.body)

    if (!email || !password) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'Email and password required' }) }
    }

    const users = loadUsers()
    const user = users[email.toLowerCase()]
    
    if (!user) {
      return { statusCode: 401, headers, body: JSON.stringify({ message: 'Invalid credentials' }) }
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
      return { statusCode: 401, headers, body: JSON.stringify({ message: 'Invalid credentials' }) }
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      },
      JWT_SECRET
    )

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' })
    }
  }
}