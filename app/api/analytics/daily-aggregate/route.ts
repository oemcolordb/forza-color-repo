import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/lib/db/db';

export async function GET() {
  try {
    await ensureTables();
    const db = getDb();

    // 1. Trending Colors (most interactions in last 24h)
    const trendingResult = await db.execute(`
      SELECT color_id, COUNT(*) as count 
      FROM color_analytics 
      WHERE created_at >= datetime('now', '-1 day')
      GROUP BY color_id 
      ORDER BY count DESC 
      LIMIT 20
    `);

    // 2. All-Time Community Top Colors
    const topResult = await db.execute(`
      SELECT color_id, SUM(CASE WHEN action = 'favorite' THEN 5 ELSE 1 END) as score
      FROM color_analytics
      GROUP BY color_id
      ORDER BY score DESC
      LIMIT 50
    `);

    // 3. Most Popular Cars (based on tunes/favorites)
    const popularCars = await db.execute(`
      SELECT car_make, car_model, COUNT(*) as count
      FROM community_tunes
      GROUP BY car_make, car_model
      ORDER BY count DESC
      LIMIT 10
    `);

    // Save to aggregated_stats
    const data = {
      trending: trendingResult.rows,
      top_colors: topResult.rows,
      popular_cars: popularCars.rows,
      timestamp: new Date().toISOString()
    };

    await db.execute({
      sql: "INSERT INTO aggregated_stats (type, data) VALUES ('community_summary', ?)",
      args: [JSON.stringify(data)]
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Aggregation failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
