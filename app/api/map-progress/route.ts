import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

// Simple server-side bot detection
function isBotRequest(request: Request): boolean {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || ''
  const botPatterns = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests']
  return botPatterns.some(pattern => userAgent.includes(pattern))
}

// Safe JSON parsing helper to handle malformed database entries
function safeJsonParse<T>(jsonString: string | null, defaultValue: T): T {
  if (!jsonString) return defaultValue
  try {
    return JSON.parse(jsonString) as T
  } catch {
    console.warn('Failed to parse JSON from database:', jsonString)
    return defaultValue
  }
}

const client =
  process.env.TURSO_DATABASE_URL &&
  process.env.TURSO_DATABASE_URL !== 'your_turso_database_url_here'
    ? createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN || '',
      })
    : null

// GET - Retrieve map progress from cloud
export async function GET(request: Request) {
  if (!client) return NextResponse.json({
    visitedLocations: [],
    favoriteLocations: [],
    activeFilters: [],
    lastViewedLocation: null,
    zoomLevel: 1,
    lastUpdated: null,
  })

  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

    const result = await client.execute({
      sql: `SELECT visitedLocations, favoriteLocations, activeFilters, lastViewedLocation, zoomLevel, lastUpdated
            FROM map_progress
            WHERE sessionId = ? OR userId = ?
            ORDER BY lastUpdated DESC LIMIT 1`,
      args: [sessionId, userId || ''],
    })

    if (result.rows.length === 0) {
      return NextResponse.json({
        visitedLocations: [],
        favoriteLocations: [],
        activeFilters: [],
        lastViewedLocation: null,
        zoomLevel: 1,
        lastUpdated: null,
      })
    }

    const row = result.rows[0]
    return NextResponse.json({
      visitedLocations: safeJsonParse(row.visitedLocations as string, []),
      favoriteLocations: safeJsonParse(row.favoriteLocations as string, []),
      activeFilters: safeJsonParse(row.activeFilters as string, []),
      lastViewedLocation: row.lastViewedLocation,
      zoomLevel: row.zoomLevel,
      lastUpdated: row.lastUpdated,
    })
  } catch (error) {
    console.error('Map progress GET error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// POST - Save map progress to cloud
export async function POST(request: Request) {
  if (isBotRequest(request)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  try {
    const body = await request.json()
    const {
      sessionId,
      userId,
      visitedLocations,
      favoriteLocations,
      activeFilters,
      lastViewedLocation,
      zoomLevel,
    } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

    await client.execute({
      sql: `INSERT INTO map_progress (sessionId, userId, visitedLocations, favoriteLocations, activeFilters, lastViewedLocation, zoomLevel, lastUpdated)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(sessionId) DO UPDATE SET
              userId = COALESCE(excluded.userId, map_progress.userId),
              visitedLocations = excluded.visitedLocations,
              favoriteLocations = excluded.favoriteLocations,
              activeFilters = excluded.activeFilters,
              lastViewedLocation = excluded.lastViewedLocation,
              zoomLevel = excluded.zoomLevel,
              lastUpdated = datetime('now')`,
      args: [
        sessionId,
        userId || null,
        JSON.stringify(visitedLocations || []),
        JSON.stringify(favoriteLocations || []),
        JSON.stringify(activeFilters || []),
        lastViewedLocation || null,
        zoomLevel || 1,
      ],
    })

    return NextResponse.json({
      success: true,
      message: 'Map progress saved',
      savedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Map progress POST error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
