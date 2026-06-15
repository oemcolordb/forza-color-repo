import { NextResponse } from 'next/server'
import { getDb, ensureTables } from '@/lib/db/db'

// ── GET /api/tuneforge/community-tunes?make=Ford&model=Mustang ──────────────
export const GET = async (request: Request) => {
  try {
    await ensureTables()
  } catch (err) {
    console.error('community-tunes: ensureTables failed:', err)
    // Return empty list instead of crashing — table may not exist yet
    return NextResponse.json([])
  }

  const client = getDb()
  const { searchParams } = new URL(request.url)
  const make  = searchParams.get('make')?.trim()
  const model = searchParams.get('model')?.trim()

  try {
    if (make && model) {
      // Normalize locale variants before matching (e.g. "Evoluzione" → "Evolution")
      const normalizedModel = model
        .replace(/evoluzione/gi, 'Evolution')
        .replace(/\s+/g, ' ')
        .trim()

      // Bidirectional fuzzy match: DB model contains query OR query contains DB model.
      // This handles cases where the tune DB uses a shorter name (e.g. "599XX EVOLUTION")
      // while cars.json has the full name ("599XX Evoluzione").
      const result = await client.execute({
        sql: `SELECT id, car_make, car_model, tune_name, tuner_name, share_code,
                     discipline, pi_class, pi_value, tune_data, votes, created_at
              FROM community_tunes
              WHERE lower(car_make) LIKE lower(?)
                AND (
                  lower(car_model) LIKE lower(?)
                  OR lower(?) LIKE '%' || lower(car_model) || '%'
                )
              ORDER BY votes DESC, created_at DESC
              LIMIT 50`,
        args: [`%${make}%`, `%${normalizedModel}%`, normalizedModel],
      })
      return NextResponse.json(result.rows)
    }

    // No filter — return most popular
    const result = await client.execute(
      `SELECT id, car_make, car_model, tune_name, tuner_name, share_code,
              discipline, pi_class, pi_value, tune_data, votes, created_at
       FROM community_tunes
       ORDER BY votes DESC, created_at DESC
       LIMIT 50`
    )
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error('community-tunes GET error:', err)
    // Graceful degradation: return empty list so the UI doesn't break
    return NextResponse.json([])
  }
}

// ── POST /api/tuneforge/community-tunes ─────────────────────────────────────
// Body: { id, car_make, car_model, tune_name, tuner_name?, share_code?,
//         discipline?, pi_class?, pi_value?, tune_data }
export const POST = async (request: Request) => {
  try {
    await ensureTables()
  } catch (err) {
    console.error('community-tunes: ensureTables failed:', err)
    return NextResponse.json({ error: 'Database initialization failed' }, { status: 503 })
  }

  const client = getDb()

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

    // INSERT only columns that exist in the schema — no ip_address
    await client.execute({
      sql: `INSERT INTO community_tunes
              (id, car_make, car_model, tune_name, tuner_name, share_code,
               discipline, pi_class, pi_value, tune_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, car_make, car_model, tune_name, tuner_name, share_code,
             discipline, pi_class, pi_value, tune_data],
    })

    return NextResponse.json({ success: true, id })
  } catch (err) {
    console.error('community-tunes POST error:', err)
    const message = err instanceof Error ? err.message : 'Save failed'

    // Duplicate key
    if (message.includes('UNIQUE constraint') || message.includes('PRIMARY KEY')) {
      return NextResponse.json({ error: 'A tune with this ID already exists' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}

// ── PATCH /api/tuneforge/community-tunes ────────────────────────────────────
// Body: { id, direction?: 'up' | 'down' }
export const PATCH = async (request: Request) => {
  try {
    await ensureTables()
  } catch (err) {
    console.error('community-tunes: ensureTables failed:', err)
    return NextResponse.json({ error: 'Database initialization failed' }, { status: 503 })
  }

  const client = getDb()

  try {
    const body = await request.json()
    const { id, direction = 'up' } = body

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const delta = direction === 'down' ? -1 : 1
    await client.execute({
      sql: 'UPDATE community_tunes SET votes = MAX(0, votes + ?) WHERE id = ?',
      args: [delta, id],
    })

    // Return updated vote count
    const result = await client.execute({
      sql: 'SELECT votes FROM community_tunes WHERE id = ?',
      args: [id],
    })

    const votes = result.rows.length > 0 ? Number(result.rows[0].votes) : 0
    return NextResponse.json({ success: true, votes })
  } catch (err) {
    console.error('community-tunes PATCH error:', err)
    return NextResponse.json({ error: 'Vote failed' }, { status: 500 })
  }
}
