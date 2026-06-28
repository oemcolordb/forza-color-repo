import { NextResponse } from 'next/server'
import { aggregationService } from '@/lib/db/aggregationService'

/**
 * Vercel Cron Endpoint for Daily Aggregation
 * 
 * This endpoint should be hit automatically every night (e.g. via Vercel Cron)
 * to process raw color and user analytics and upsert them into the efficient
 * daily_color_stats and daily_usage_stats tables.
 * 
 * By default, it processes yesterday's data. You can pass a `?date=YYYY-MM-DD` 
 * to manually trigger a specific day.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    // Optional manual auth guard for cron endpoints
    // (In production, Vercel secures cron routes using a CRON_SECRET)
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let targetDate: Date | undefined
    if (dateParam) {
      targetDate = new Date(dateParam)
      if (isNaN(targetDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 })
      }
    }

    const result = await aggregationService.aggregateDailyStats(targetDate)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: result.message })
  } catch (error) {
    console.error('[Cron Aggregate API] Error:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
