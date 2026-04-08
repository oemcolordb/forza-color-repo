import { createClient } from '@libsql/client'
import { NextResponse } from 'next/server'

const client =
  process.env.TURSO_DATABASE_URL &&
  process.env.TURSO_DATABASE_URL !== 'your_turso_database_url_here'
    ? createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN || '',
      })
    : null

// GET /api/tuneforge/community-tunes?make=Ford&model=Mustang
export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const make  = searchParams.get('make')?.trim()
  const model = searchParams.get('model')?.trim()

  if (!client) return NextResponse.json([])

  try {
    if (make && model) {
      // Fuzzy match — tune DB names may differ slightly from cars.json names
      const result = await client.execute({
        sql: `SELECT * FROM community_tunes
              WHERE lower(car_make) LIKE lower(?)
                AND lower(car_model) LIKE lower(?)
              ORDER BY votes DESC, created_at DESC
              LIMIT 50`,
        args: [`%${make}%`, `%${model}%`],
      })
      return NextResponse.json(result.rows)
    }

    // No filter — return most popular
    const result = await client.execute(
      `SELECT * FROM community_tunes ORDER BY votes DESC, created_at DESC LIMIT 50`
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}

// POST /api/tuneforge/community-tunes
// Body: { id, car_make, car_model, tune_name, tuner_name?, share_code?, discipline?, pi_class?, pi_value?, tune_data }
export const POST = async (request: Request) => {
  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  try {
    const body = await request.json()
    const {
      id,
      car_make,
      car_model,
      tune_name,
      tuner_name = 'Anonymous',
      share_code = null,
      discipline = 'General',
      pi_class   = null,
      pi_value   = null,
      tune_data,
    } = body

    if (!id || !car_make || !car_model || !tune_name || !tune_data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate share_code format: exactly 9 digits (FH5 standard)
    if (share_code && !/^\d{9}$/.test(share_code)) {
      return NextResponse.json({ error: 'Share code must be 9 digits' }, { status: 400 })
    }

    await client.execute({
      sql: `INSERT INTO community_tunes
              (id, car_make, car_model, tune_name, tuner_name, share_code,
               discipline, pi_class, pi_value, tune_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, car_make, car_model, tune_name, tuner_name, share_code,
             discipline, pi_class, pi_value, tune_data],
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}

// PATCH /api/tuneforge/community-tunes  — upvote a tune
// Body: { id }
export const PATCH = async (request: Request) => {
  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    await client.execute({
      sql: 'UPDATE community_tunes SET votes = votes + 1 WHERE id = ?',
      args: [id],
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Vote failed' }, { status: 500 })
  }
}
