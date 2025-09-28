const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')

// Simple user store (use database in production)
const users = new Map()

const JWT_SECRET = process.env.JWT_SECRET || 'forza-colors-secret-key-change-in-production'

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { email, password, name } = JSON.parse(event.body)

    if (!email || !password) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and password required' }) }
    }

    if (password.length < 8) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Password must be at least 8 characters' }) }
    }

    const emailLower = email.toLowerCase()
    if (users.has(emailLower)) {
      return { statusCode: 409, headers, body: JSON.stringify({ error: 'User already exists' }) }
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const userId = uuidv4()

    const user = {
      id: userId,
      email: emailLower,
      name: name || email.split('@')[0],
      passwordHash,
      role: 'user',
      createdAt: new Date().toISOString()
    }

    users.set(emailLower, user)

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
      statusCode: 201,
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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}