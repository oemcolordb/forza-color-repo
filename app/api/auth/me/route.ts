import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { getDb } from '@/lib/db/db'
import { logger } from '@/lib/utils/logger'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'forza-color-universe-super-secret-key-123'
)

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('forza_auth_token')?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.sub as string

    if (!userId) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Fetch fresh user data from database
    const db = getDb()
    const result = await db.execute({
      sql: 'SELECT id, email, name, discord_id, discord_username, xbox_id, xbox_gamertag FROM users WHERE id = ?',
      args: [userId],
    })

    const user = result.rows[0] as any

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Fetch linked connections
    const connectionsResult = await db.execute({
      sql: 'SELECT provider, provider_id, username FROM user_connections WHERE user_id = ?',
      args: [userId],
    })
    
    const connections = connectionsResult.rows.map(row => ({
      provider: row.provider as string,
      providerId: row.provider_id as string,
      username: row.username as string,
    }))

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: 'user',
        discordId: user.discord_id,
        discordUsername: user.discord_username,
        xboxId: user.xbox_id,
        xboxGamertag: user.xbox_gamertag,
        connections,
      },
    })
  } catch (error) {
    logger.error('Auth check error:', error)
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
