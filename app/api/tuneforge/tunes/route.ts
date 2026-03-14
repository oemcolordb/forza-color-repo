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

export const POST = async (request: Request) => {
  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  try {
    const { id, name, car_make, car_model, tune_data } = await request.json()

    await client.execute({
      sql: 'INSERT INTO tunes (id, name, car_make, car_model, tune_data) VALUES (?, ?, ?, ?, ?)',
      args: [id, name, car_make, car_model, tune_data],
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}

export const GET = async () => {
  if (!client) return NextResponse.json([])

  try {
    const result = await client.execute('SELECT * FROM tunes ORDER BY created_at DESC LIMIT 50')
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}
