import { NextResponse } from 'next/server'
import { getDb, ensureTables } from '@/app/lib/db'

// Validate and sanitize IP address
function validateIPAddress(ip: string): string {
  // Trim whitespace
  const trimmed = ip.trim()

  // Check for valid IPv4 format
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (ipv4Regex.test(trimmed)) {
    // Validate each octet is 0-255
    const octets = trimmed.split('.').map(Number)
    if (octets.every(o => o >= 0 && o <= 255)) {
      return trimmed
    }
  }

  // Check for valid IPv6 format (basic check)
  const ipv6Regex = /^([0-9a-fA-F:]+)$/
  if (ipv6Regex.test(trimmed) && trimmed.includes(':')) {
    // Basic IPv6 validation - must have at least 2 colons and valid length
    if (trimmed.length <= 45 && trimmed.split(':').length >= 2) {
      return trimmed.toLowerCase()
    }
  }

  // Return 'unknown' for invalid IPs
  return 'unknown'
}

// GET /api/tuneforge/community-tunes?make=Ford&model=Mustang
export const GET = async (request: Request) => {
  await ensureTables()
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
      try {
        const result = await client.execute({
          sql: `SELECT * FROM community_tunes
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
    const rawIp = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
    const ip_address = validateIPAddress(rawIp)
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
  } catch (error) {
    console.error('Failed to save community tune:', error)
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
  } catch (error) {
    console.error('Failed to vote on community tune:', error)
    return NextResponse.json({ error: 'Vote failed' }, { status: 500 })
  }
}
