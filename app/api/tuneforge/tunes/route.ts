import { NextResponse } from 'next/server'
import { getDb, ensureTables } from '@/app/lib/db'

export const POST = async (request: Request) => {
  await ensureTables()
  const client = getDb()

  try {
    const { id, name, car_make, car_model, tune_data } = await request.json()

    await client.execute({
      sql: 'INSERT INTO tunes (id, name, car_make, car_model, tune_data) VALUES (?, ?, ?, ?, ?)',
      args: [id, name, car_make, car_model, tune_data],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save tune:', error)
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}

export const GET = async () => {
  await ensureTables()
  const client = getDb()

  try {
    const result = await client.execute('SELECT * FROM tunes ORDER BY created_at DESC LIMIT 50')
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch tunes:', error)
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}
