import { NextRequest, NextResponse } from 'next/server'
import { getDb, ensureTables } from '@/lib/db/db'
import { auth } from '@/auth'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'forza-color-universe-super-secret-key-123'
)

async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // 1. Check NextAuth session
  try {
    const session = await auth()
    if (session?.user?.id) {
      return session.user.id
    }
  } catch (_) {}

  // 2. Check credentials JWT cookie
  const token = request.cookies.get('forza_auth_token')?.value
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      return payload.sub as string
    } catch (_) {}
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await ensureTables()
    const db = getDb()

    const connectionsResult = await db.execute({
      sql: 'SELECT provider, provider_id, username, email, created_at FROM user_connections WHERE user_id = ?',
      args: [userId],
    })

    const connections = connectionsResult.rows.map(row => ({
      provider: row.provider as string,
      providerId: row.provider_id as string,
      username: row.username as string,
      email: row.email as string,
      createdAt: row.created_at as string,
    }))

    return NextResponse.json({ connections })
  } catch (error: any) {
    console.error('Linked accounts GET error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { provider, providerId, username, email } = await request.json()

    if (!provider || !providerId) {
      return NextResponse.json({ message: 'Provider and provider ID are required' }, { status: 400 })
    }

    if (provider !== 'discord' && provider !== 'xbox') {
      return NextResponse.json({ message: 'Invalid provider' }, { status: 400 })
    }

    await ensureTables()
    const db = getDb()

    // 1. Update the flat columns on users table
    if (provider === 'discord') {
      await db.execute({
        sql: 'UPDATE users SET discord_id = ?, discord_username = ? WHERE id = ?',
        args: [providerId, username || null, userId],
      })
    } else if (provider === 'xbox') {
      await db.execute({
        sql: 'UPDATE users SET xbox_id = ?, xbox_gamertag = ? WHERE id = ?',
        args: [providerId, username || null, userId],
      })
    }

    // 2. Upsert user connection record
    await db.execute({
      sql: `INSERT INTO user_connections (id, user_id, provider, provider_id, username, email)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, provider) DO UPDATE SET
              provider_id = excluded.provider_id,
              username = excluded.username,
              email = excluded.email`,
      args: [`${userId}-${provider}`, userId, provider, providerId, username || null, email || null],
    })

    return NextResponse.json({ success: true, message: `${provider} account linked successfully` })
  } catch (error: any) {
    console.error('Linked accounts POST error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

    if (!provider || (provider !== 'discord' && provider !== 'xbox')) {
      return NextResponse.json({ message: 'Valid provider (discord or xbox) is required' }, { status: 400 })
    }

    await ensureTables()
    const db = getDb()

    // 1. Remove connection
    await db.execute({
      sql: 'DELETE FROM user_connections WHERE user_id = ? AND provider = ?',
      args: [userId, provider],
    })

    // 2. Null out the flat columns in users table
    if (provider === 'discord') {
      await db.execute({
        sql: 'UPDATE users SET discord_id = NULL, discord_username = NULL WHERE id = ?',
        args: [userId],
      })
    } else if (provider === 'xbox') {
      await db.execute({
        sql: 'UPDATE users SET xbox_id = NULL, xbox_gamertag = NULL WHERE id = ?',
        args: [userId],
      })
    }

    return NextResponse.json({ success: true, message: `${provider} account unlinked successfully` })
  } catch (error: any) {
    console.error('Linked accounts DELETE error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
