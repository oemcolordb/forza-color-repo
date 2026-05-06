import { NextResponse } from 'next/server'
import { getDb, ensureTables } from '@/app/lib/db'

// GET /api/tuneforge/community-tunes?make=Ford&model=Mustang
export const GET = async (request: Request) => {
  await ensureTables()
  const client = getDb()
  const { searchParams } = new URL(request.url)
  const make  = searchParams.get('make')?.trim()
  const model = searchParams.get('model')?.trim()

  console.log(`[DEBUG] Community tunes request: make="${make}", model="${model}"`)

  try {
    if (make && model) {
      // Normalize locale variants before matching (e.g. "Evoluzione" → "Evolution")
      const normalizedModel = model
        .replace(/evoluzione/gi, 'Evolution')
        .replace(/\s+/g, ' ')
        .trim()

      // Extract short model name (e.g., "GT-R" from "Nissan GT-R Nismo")
      const shortModel = normalizedModel.split(' ').pop() || normalizedModel

      // Bidirectional fuzzy match with multiple strategies
      // Strategy 1: Exact make + model contains query
      // Strategy 2: Exact make + query contains model
      // Strategy 3: Make contains + short model match (for partial matches)
      try {
        const result = await client.execute({
          sql: `SELECT * FROM community_tunes
                WHERE (
                  -- Strategy 1: Make matches AND model contains query
                  (lower(car_make) LIKE lower(?)
                   AND lower(car_model) LIKE lower(?))
                  OR
                  -- Strategy 2: Make matches AND query contains model
                  (lower(car_make) LIKE lower(?)
                   AND lower(?) LIKE '%' || lower(car_model) || '%')
                  OR
                  -- Strategy 3: Make contains AND short model matches
                  (lower(car_make) LIKE lower(?)
                   AND lower(car_model) LIKE lower(?))
                )
                ORDER BY votes DESC, created_at DESC
                LIMIT 50`,
          args: [
            `%${make}%`, `%${normalizedModel}%`,  // Strategy 1
            `%${make}%`, normalizedModel,         // Strategy 2
            `%${make}%`, `%${shortModel}%`        // Strategy 3
          ],
        })
        console.log(`[DEBUG] Found ${result.rows.length} tunes for ${make} ${model}`)
        return NextResponse.json(result.rows)
      } catch (dbErr) {
        console.warn('community-tunes query failed, returning empty list:', dbErr)
        return NextResponse.json([])
      }
    }

    // No filter — return most popular
    try {
      const result = await client.execute(
        `SELECT * FROM community_tunes ORDER BY votes DESC, created_at DESC LIMIT 50`
      )
      return NextResponse.json(result.rows)
    } catch (dbErr) {
      console.warn('community-tunes fallback query failed, returning empty list:', dbErr)
      return NextResponse.json([])
    }
  } catch {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}

// POST /api/tuneforge/community-tunes
// Body: { id, car_make, car_model, tune_name, tuner_name?, share_code?, discipline?, pi_class?, pi_value?, tune_data }
export const POST = async (request: Request) => {
  await ensureTables()
  const client = getDb()

  try {
    const ip_address = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
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
               discipline, pi_class, pi_value, tune_data, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, car_make, car_model, tune_name, tuner_name, share_code,
             discipline, pi_class, pi_value, tune_data, ip_address],
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}

// PATCH /api/tuneforge/community-tunes  — upvote a tune
// Body: { id }
export const PATCH = async (request: Request) => {
  await ensureTables()
  const client = getDb()

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
