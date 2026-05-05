import { NextRequest, NextResponse } from 'next/server'
import { getDb, ensureTables } from '../../../lib/db'
import { SignJWT } from 'jose'
import { scryptSync, timingSafeEqual } from 'crypto'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'forza-color-universe-super-secret-key-123'
)

function verifyPassword(password: string, hash: string) {
  const [salt, key] = hash.split(':')
  const keyBuffer = Buffer.from(key, 'hex')
  const derivedKey = scryptSync(password, salt, 64)
  return timingSafeEqual(keyBuffer, derivedKey)
}

export async function POST(request: NextRequest) {
  try {
    await ensureTables()
    const db = getDb()
    const { email, password, sessionId } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email],
    })

    const user = result.rows[0] as any

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    // Merge any anonymous favorites linked to this session to the existing account safely
    if (sessionId) {
      // First, update any favorites that don't conflict with the user's existing favorites
      await db.execute({
        sql: `UPDATE favorites
              SET userId = ?
              WHERE sessionId = ? AND userId IS NULL
              AND car_id NOT IN (SELECT car_id FROM favorites WHERE userId = ?)`,
        args: [user.id, sessionId, user.id],
      })

      // Then, delete any remaining local favorites that were duplicates
      await db.execute({
        sql: 'DELETE FROM favorites WHERE sessionId = ? AND userId IS NULL',
        args: [sessionId],
      })
    }

    // Generate JWT
    const token = await new SignJWT({
      sub: user.id as string,
      email: user.email as string,
      name: user.name as string,
      role: 'user',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    const userData = { id: user.id, email: user.email, name: user.name, role: 'user' }
    const response = NextResponse.json({ user: userData })

    // Set HTTP-only secure cookie
    response.cookies.set('forza_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 })
  }
}
