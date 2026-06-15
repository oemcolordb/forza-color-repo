import { NextResponse } from 'next/server'
import { getDb, ensureTables } from '@/lib/db/db'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    await ensureTables()
    const { color_id, action, user_id } = await request.json()

    if (!color_id || !action) {
      return NextResponse.json({ error: 'Missing color_id or action' }, { status: 400 })
    }

    const db = getDb()
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex')

    await db.execute({
      sql: 'INSERT INTO color_analytics (color_id, action, user_id, ip_hash) VALUES (?, ?, ?, ?)',
      args: [color_id, action, user_id || null, ipHash]
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
