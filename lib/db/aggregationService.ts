import { getDb, ensureTables } from './db'

export class AggregationService {
  /**
   * Run daily aggregation for a specific date (defaults to yesterday if none provided, 
   * which is standard for a nightly cron job).
   */
  async aggregateDailyStats(targetDate?: Date): Promise<{ success: boolean; message: string }> {
    await ensureTables()
    const db = getDb()

    // Determine the date string to aggregate (format: YYYY-MM-DD)
    const dateToProcess = targetDate || new Date(Date.now() - 86400000)
    const dateString = dateToProcess.toISOString().split('T')[0]

    console.log(`[AggregationService] Starting aggregation for date: ${dateString}`)

    try {
      // 1. Aggregate daily color stats
      const colorStatsResult = await db.execute({
        sql: `
          SELECT 
            color_id,
            SUM(CASE WHEN action = 'view' THEN 1 ELSE 0 END) as views,
            SUM(CASE WHEN action = 'favorite' THEN 1 ELSE 0 END) as favorites,
            SUM(CASE WHEN action = 'copy' THEN 1 ELSE 0 END) as copies,
            SUM(CASE WHEN action = 'share' THEN 1 ELSE 0 END) as shares
          FROM color_analytics
          WHERE DATE(created_at) = ?
          GROUP BY color_id
        `,
        args: [dateString]
      })

      // Upsert into daily_color_stats
      for (const row of colorStatsResult.rows) {
        await db.execute({
          sql: `
            INSERT INTO daily_color_stats (date_string, color_id, views, favorites, copies, shares)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(date_string, color_id) DO UPDATE SET
              views = excluded.views,
              favorites = excluded.favorites,
              copies = excluded.copies,
              shares = excluded.shares
          `,
          args: [
            dateString, 
            row.color_id, 
            row.views, 
            row.favorites, 
            row.copies, 
            row.shares
          ]
        })
      }

      // 2. Aggregate daily usage stats
      const usageResult = await db.execute({
        sql: `
          SELECT 
            COUNT(DISTINCT COALESCE(user_id, ip_hash)) as active_users,
            COUNT(*) as total_actions
          FROM color_analytics
          WHERE DATE(created_at) = ?
        `,
        args: [dateString]
      })

      const activeUsers = usageResult.rows[0]?.active_users ?? 0
      const totalActions = usageResult.rows[0]?.total_actions ?? 0

      // Upsert into daily_usage_stats
      await db.execute({
        sql: `
          INSERT INTO daily_usage_stats (date_string, active_users, total_actions)
          VALUES (?, ?, ?)
          ON CONFLICT(date_string) DO UPDATE SET
            active_users = excluded.active_users,
            total_actions = excluded.total_actions
        `,
        args: [dateString, activeUsers, totalActions]
      })

      return { success: true, message: `Aggregated stats for ${dateString} successfully.` }
    } catch (error) {
      console.error('[AggregationService] Error during daily aggregation:', error)
      return { success: false, message: (error as Error).message }
    }
  }

  /**
   * Get the top colors based on aggregated stats over a timeframe.
   */
  async getTopColors(days: number = 7, limit: number = 20): Promise<Array<{ color_id: string; total_score: number }>> {
    await ensureTables()
    const db = getDb()
    
    // We compute a "score" (e.g. favorites count * 2 + views + copies*3) over the last N days
    const result = await db.execute({
      sql: `
        SELECT 
          color_id, 
          SUM(views + (favorites * 5) + (copies * 2) + (shares * 3)) as total_score
        FROM daily_color_stats
        WHERE date_string >= DATE('now', '-' || ? || ' days')
        GROUP BY color_id
        ORDER BY total_score DESC
        LIMIT ?
      `,
      args: [days.toString(), limit]
    })

    return result.rows.map(r => ({
      color_id: r.color_id as string,
      total_score: Number(r.total_score)
    }))
  }

  /**
   * Get usage trends for a dashboard.
   */
  async getUsageTrends(days: number = 30) {
    await ensureTables()
    const db = getDb()

    const result = await db.execute({
      sql: `
        SELECT date_string, active_users, total_actions
        FROM daily_usage_stats
        WHERE date_string >= DATE('now', '-' || ? || ' days')
        ORDER BY date_string ASC
      `,
      args: [days.toString()]
    })

    return result.rows
  }
}

export const aggregationService = new AggregationService()
