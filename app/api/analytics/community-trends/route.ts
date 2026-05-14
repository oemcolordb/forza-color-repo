import { NextResponse } from 'next/server'
import { getDb, ensureTables } from '@/app/lib/db'

export async function GET() {
  try {
    await ensureTables()
    const db = getDb()

    // Try to get pre-aggregated summary first
    const aggregated = await db.execute("SELECT data FROM aggregated_stats WHERE type = 'community_summary' ORDER BY updated_at DESC LIMIT 1")
    
    if (aggregated.rows.length > 0) {
      const data = JSON.parse(aggregated.rows[0].data as string)
      return NextResponse.json({ 
        ...data,
        source: 'cache'
      })
    }

    // Fallback: Real-time calculation if no cache exists
    const topColors = await db.execute(`
      SELECT 
        color_id,
        SUM(CASE WHEN action = 'favorite' THEN 5 ELSE 1 END) as score,
        COUNT(*) as total_interactions
      FROM color_analytics
      GROUP BY color_id
      ORDER BY score DESC
      LIMIT 20
    `)

    return NextResponse.json({ 
      trends: topColors.rows,
      last_updated: new Date().toISOString(),
      source: 'live'
    })
  } catch (error) {
    console.error('Fetching trends failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
