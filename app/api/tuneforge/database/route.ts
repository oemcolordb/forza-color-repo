import { NextResponse } from 'next/server'
import { getDb, ensureTables } from '@/app/lib/db'

export const POST = async () => {
  await ensureTables()
  const client = getDb()

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
    console.error('Database POST error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export const GET = async () => {
  await ensureTables()
  const client = getDb()

  try {
    const tunes = await client.execute('SELECT * FROM tunes ORDER BY created_at DESC')
    return NextResponse.json(tunes.rows)
  } catch (error) {
    console.error('Database GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
