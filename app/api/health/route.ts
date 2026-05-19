import { NextResponse } from 'next/server'
import { getDb, ensureTables } from '@/app/lib/db'

/**
 * GET /api/health
 * 
 * Lightweight health check endpoint used for:
 *   1. Vercel cron-based cold start prevention (runs every 5 min)
 *   2. External uptime monitoring
 *   3. Database connectivity verification
 *
 * Keeps the serverless function warm by exercising the DB connection
 * and ensuring tables are initialized, so real user requests never
 * hit a cold start + migration combo.
 */
export const GET = async () => {
  const start = Date.now()

  try {
    // Touch the DB to keep the connection warm
    await ensureTables()
    const db = getDb()

    // Lightweight query to verify DB is responsive
    const result = await db.execute(
      "SELECT COUNT(*) as tune_count FROM community_tunes"
    )
    const tuneCount = Number(result.rows[0]?.tune_count ?? 0)

    const latency = Date.now() - start

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      latency_ms: latency,
      database: {
        connected: true,
        community_tunes: tuneCount,
      },
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
    })
  } catch (err) {
    const latency = Date.now() - start
    console.error('Health check failed:', err)

    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        latency_ms: latency,
        database: { connected: false },
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}
