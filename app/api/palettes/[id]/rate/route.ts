import { NextResponse } from 'next/server'
import { getDb, ensureTables } from '@/lib/db/db'
import { checkBotId } from 'botid/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const botCheck = await checkBotId()
  if (botCheck.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

  try {
    await ensureTables()
    const db = getDb()
    const { id: paletteId } = await params
    const body = await request.json()
    const { sessionId, rating } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

    const ratingVal = parseInt(rating, 10)
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 })
    }

    // Upsert the rating
    const checkExist = await db.execute({
      sql: 'SELECT 1 FROM palette_ratings WHERE paletteId = ? AND sessionId = ?',
      args: [paletteId, sessionId]
    })

    if (checkExist.rows.length > 0) {
      await db.execute({
        sql: 'UPDATE palette_ratings SET rating = ? WHERE paletteId = ? AND sessionId = ?',
        args: [ratingVal, paletteId, sessionId]
      })
    } else {
      await db.execute({
        sql: 'INSERT INTO palette_ratings (paletteId, sessionId, rating) VALUES (?, ?, ?)',
        args: [paletteId, sessionId, ratingVal]
      })
    }

    // Recalculate average and count
    const statsResult = await db.execute({
      sql: 'SELECT AVG(rating) as avg_rating, COUNT(rating) as count_rating FROM palette_ratings WHERE paletteId = ?',
      args: [paletteId]
    })

    const avgRating = statsResult.rows[0]?.avg_rating !== null ? Number(statsResult.rows[0]?.avg_rating) : 0.0
    const countRating = statsResult.rows[0]?.count_rating !== null ? Number(statsResult.rows[0]?.count_rating) : 0

    // Update main palettes table
    await db.execute({
      sql: 'UPDATE palettes SET rating_avg = ?, rating_count = ? WHERE id = ?',
      args: [avgRating, countRating, paletteId]
    })

    return NextResponse.json({
      success: true,
      rating_avg: avgRating,
      rating_count: countRating,
      userRating: ratingVal
    })
  } catch (error) {
    console.error('Palette rate POST error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTables()
    const db = getDb()
    const { id: paletteId } = await params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    // Get overall stats
    const statsResult = await db.execute({
      sql: 'SELECT rating_avg, rating_count FROM palettes WHERE id = ?',
      args: [paletteId]
    })

    const avgRating = statsResult.rows[0]?.rating_avg !== undefined ? Number(statsResult.rows[0]?.rating_avg) : 0.0
    const countRating = statsResult.rows[0]?.rating_count !== undefined ? Number(statsResult.rows[0]?.rating_count) : 0

    let userRating = null
    if (sessionId) {
      const userRatingResult = await db.execute({
        sql: 'SELECT rating FROM palette_ratings WHERE paletteId = ? AND sessionId = ?',
        args: [paletteId, sessionId]
      })
      if (userRatingResult.rows.length > 0) {
        userRating = Number(userRatingResult.rows[0].rating)
      }
    }

    return NextResponse.json({
      rating_avg: avgRating,
      rating_count: countRating,
      userRating
    })
  } catch (error) {
    console.error('Palette rate GET error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
