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

export const POST = async () => {
  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS tunes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        car_make TEXT NOT NULL,
        car_model TEXT NOT NULL,
        tune_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export const GET = async () => {
  if (!client) return NextResponse.json([])

  try {
    const tunes = await client.execute('SELECT * FROM tunes ORDER BY created_at DESC')
    return NextResponse.json(tunes.rows)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
