import { NextRequest, NextResponse } from 'next/server'
import { getDb, ensureTables } from '@/lib/db/db'
import { logger } from '@/lib/utils/logger'
import { jwtVerify } from 'jose'
import { scryptSync, timingSafeEqual, randomBytes } from 'crypto'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'forza-color-universe-super-secret-key-123'
)

function verifyPassword(password: string, hash: string) {
  const [salt, key] = hash.split(':')
  const keyBuffer = Buffer.from(key, 'hex')
  const derivedKey = scryptSync(password, salt, 64)
  return timingSafeEqual(keyBuffer, derivedKey)
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derivedKey}`
}

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Current and new passwords are required' }, { status: 400 })
    }

    const token = request.cookies.get('forza_auth_token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    let userId: string
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      userId = payload.sub as string
    } catch {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    await ensureTables()
    const db = getDb()

    const result = await db.execute({
      sql: 'SELECT password FROM users WHERE id = ?',
      args: [userId],
    })

    const user = result.rows[0] as any
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    if (!verifyPassword(currentPassword, user.password)) {
      return NextResponse.json({ message: 'Incorrect current password' }, { status: 401 })
    }

    const newHashedPassword = hashPassword(newPassword)
    await db.execute({
      sql: 'UPDATE users SET password = ? WHERE id = ?',
      args: [newHashedPassword, userId],
    })

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (error: any) {
    logger.error('Change password error:', error)
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 })
  }
}
