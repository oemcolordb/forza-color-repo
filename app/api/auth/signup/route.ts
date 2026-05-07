import { NextRequest, NextResponse } from 'next/server'
import { getDb, ensureTables } from '../../../lib/db'
import { logger } from '../../../lib/logger'
import { SignJWT } from 'jose'
import { randomUUID, randomBytes, scryptSync } from 'crypto'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'forza-color-universe-super-secret-key-123'
)

// Zero-dependency secure password hashing using Node's built-in crypto
function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derivedKey}`
}

export async function POST(request: NextRequest) {
  try {
    await ensureTables()
    const db = getDb()
    const { email, password, name, sessionId } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email],
    })

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ message: 'A user with this email already exists' }, { status: 400 })
    }

    const id = randomUUID()
    const hashedPassword = hashPassword(password)

    await db.execute({
      sql: 'INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)',
      args: [id, email, hashedPassword, name || ''],
    })

    // Migrate any anonymous favorites linked to this session to the new user account
    if (sessionId) {
      await db.execute({
        sql: 'UPDATE favorites SET userId = ? WHERE sessionId = ? AND userId IS NULL',
        args: [id, sessionId],
      })
    }

    // Generate JWT
    const token = await new SignJWT({ sub: id, email, name, role: 'user' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    const response = NextResponse.json({ user: { id, email, name, role: 'user' } })

    // Set HTTP-only secure cookie
    response.cookies.set('forza_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error: any) {
    logger.error('Signup error:', error)
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 })
  }
}
