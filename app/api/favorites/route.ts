import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client'
import { checkBotId } from '@/botid/server'

const client =
  process.env.TURSO_DATABASE_URL &&
  process.env.TURSO_DATABASE_URL !== 'your_turso_database_url_here'
    ? createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN || '',
      })
    : null

// GET - Retrieve user favorites from cloud
export async function GET(request: Request) {
  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

    const result = await client.execute({
      sql: 'SELECT favorites, lastSynced FROM user_favorites WHERE sessionId = ? OR userId = ? ORDER BY lastSynced DESC LIMIT 1',
      args: [sessionId, userId || ''],
    })

    if (result.rows.length === 0) {
      return NextResponse.json({ favorites: [], lastSynced: null })
    }

    const row = result.rows[0]
    return NextResponse.json({
      favorites: JSON.parse(row.favorites as string),
      lastSynced: row.lastSynced,
    })
  } catch (error) {
    console.error('Favorites GET error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// POST - Sync favorites to cloud and track analytics
export async function POST(request: Request) {
  const botCheck = await checkBotId()
  if (botCheck.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  try {
    const ip_address = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
    const body = await request.json()
    const { sessionId, userId, favorites, colorDetails } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

    // Upsert user favorites
    await client.execute({
      sql: `INSERT INTO user_favorites (sessionId, userId, favorites, lastSynced, ip_address)
            VALUES (?, ?, ?, datetime('now'), ?)
            ON CONFLICT(sessionId) DO UPDATE SET
              favorites = excluded.favorites,
              userId = COALESCE(excluded.userId, user_favorites.userId),
              ip_address = COALESCE(excluded.ip_address, user_favorites.ip_address),
              lastSynced = datetime('now')`,
      args: [sessionId, userId || null, JSON.stringify(favorites), ip_address],
    })

    // Track analytics for each color if details provided
    if (colorDetails && Array.isArray(colorDetails)) {
      for (const color of colorDetails) {
        // Log the favorite action
        await client.execute({
          sql: `INSERT INTO favorites_analytics (colorId, colorName, make, model, colorType, userId, sessionId, action, ip_address)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'add', ?)`,
          args: [
            color.colorId,
            color.colorName,
            color.make,
            color.model || null,
            color.colorType || null,
            userId || null,
            sessionId,
            ip_address
          ],
        })

        // Update ranking
        await client.execute({
          sql: `INSERT INTO favorites_ranking (colorId, colorName, make, model, colorType, totalFavorites, currentFavorites, lastUpdated)
                VALUES (?, ?, ?, ?, ?, 1, 1, datetime('now'))
                ON CONFLICT(colorId) DO UPDATE SET
                  totalFavorites = favorites_ranking.totalFavorites + 1,
                  currentFavorites = favorites_ranking.currentFavorites + 1,
                  lastUpdated = datetime('now')`,
          args: [
            color.colorId,
            color.colorName,
            color.make,
            color.model || null,
            color.colorType || null,
          ],
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Favorites synced successfully',
      syncedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Favorites POST error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// DELETE - Remove a favorite and track analytics
export async function DELETE(request: Request) {
  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const colorId = searchParams.get('colorId')
    const userId = searchParams.get('userId')

    if (!sessionId || !colorId) {
      return NextResponse.json({ error: 'sessionId and colorId required' }, { status: 400 })
    }

    // Log removal action
    await client.execute({
      sql: `INSERT INTO favorites_analytics (colorId, colorName, make, model, colorType, userId, sessionId, action)
            SELECT ?, colorName, make, model, colorType, ?, ?, 'remove'
            FROM favorites_ranking WHERE colorId = ?`,
      args: [colorId, userId || null, sessionId, colorId],
    })

    // Decrement current favorites count
    await client.execute({
      sql: `UPDATE favorites_ranking 
            SET currentFavorites = MAX(0, currentFavorites - 1),
                lastUpdated = datetime('now')
            WHERE colorId = ?`,
      args: [colorId],
    })

    return NextResponse.json({ success: true, message: 'Favorite removed' })
  } catch (error) {
    console.error('Favorites DELETE error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
