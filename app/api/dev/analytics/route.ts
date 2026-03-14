import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

const client =
  process.env.TURSO_DATABASE_URL &&
  process.env.TURSO_DATABASE_URL !== 'your_turso_database_url_here'
    ? createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN || '',
      })
    : null

// Secret dev-only endpoint for favorites analytics
// Protected by DEV_ANALYTICS_KEY environment variable
export async function GET(request: Request) {
  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  try {
    const { searchParams } = new URL(request.url)
    const devKey = searchParams.get('key')
    const limit = parseInt(searchParams.get('limit') || '50')
    const timeRange = searchParams.get('range') || '7d' // 7d, 30d, all

    // Verify dev access key
    if (!devKey || devKey !== process.env.DEV_ANALYTICS_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate date filter
    let dateFilter = ''
    if (timeRange === '7d') {
      dateFilter = "AND lastUpdated >= datetime('now', '-7 days')"
    } else if (timeRange === '30d') {
      dateFilter = "AND lastUpdated >= datetime('now', '-30 days')"
    }

    // Get top favorited colors
    const topColors = await client.execute({
      sql: `SELECT colorId, colorName, make, model, colorType, totalFavorites, currentFavorites, lastUpdated
            FROM favorites_ranking
            WHERE 1=1 ${dateFilter}
            ORDER BY currentFavorites DESC, totalFavorites DESC
            LIMIT ?`,
      args: [limit],
    })

    // Get favorites trend over time
    const trendData = await client.execute({
      sql: `SELECT 
              date(createdAt) as date,
              COUNT(*) as total,
              SUM(CASE WHEN action = 'add' THEN 1 ELSE 0 END) as adds,
              SUM(CASE WHEN action = 'remove' THEN 1 ELSE 0 END) as removes
            FROM favorites_analytics
            WHERE createdAt >= datetime('now', '-30 days')
            GROUP BY date(createdAt)
            ORDER BY date DESC`,
      args: [],
    })

    // Get top makes
    const topMakes = await client.execute({
      sql: `SELECT make, SUM(currentFavorites) as totalFavorites, COUNT(*) as colorCount
            FROM favorites_ranking
            GROUP BY make
            ORDER BY totalFavorites DESC
            LIMIT 10`,
      args: [],
    })

    // Get top color types
    const topColorTypes = await client.execute({
      sql: `SELECT colorType, SUM(currentFavorites) as totalFavorites, COUNT(*) as colorCount
            FROM favorites_ranking
            WHERE colorType IS NOT NULL
            GROUP BY colorType
            ORDER BY totalFavorites DESC
            LIMIT 10`,
      args: [],
    })

    // Get total stats
    const stats = await client.execute({
      sql: `SELECT 
              COUNT(DISTINCT sessionId) as uniqueSessions,
              COUNT(DISTINCT userId) as uniqueUsers,
              COUNT(*) as totalActions,
              SUM(CASE WHEN action = 'add' THEN 1 ELSE 0 END) as totalAdds,
              SUM(CASE WHEN action = 'remove' THEN 1 ELSE 0 END) as totalRemoves
            FROM favorites_analytics`,
      args: [],
    })

    return NextResponse.json({
      success: true,
      data: {
        topColors: topColors.rows,
        trendData: trendData.rows,
        topMakes: topMakes.rows,
        topColorTypes: topColorTypes.rows,
        stats: stats.rows[0] || {},
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
