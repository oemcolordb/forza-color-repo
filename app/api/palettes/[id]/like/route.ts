import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client'
import { checkBotId } from 'botid/server'

const client =
  process.env.TURSO_DATABASE_URL &&
  process.env.TURSO_DATABASE_URL !== 'your_turso_database_url_here'
    ? createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN || '',
      })
    : null

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const botCheck = await checkBotId()
  if (botCheck.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  try {
    const { id: paletteId } = await params
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

    // Check if like exists
    const result = await client.execute({
      sql: 'SELECT 1 FROM palette_likes WHERE paletteId = ? AND sessionId = ?',
      args: [paletteId, sessionId],
    })

    const isLiked = result.rows.length > 0

    if (isLiked) {
      // Remove like
      await client.execute({
        sql: 'DELETE FROM palette_likes WHERE paletteId = ? AND sessionId = ?',
        args: [paletteId, sessionId],
      })
      await client.execute({
        sql: 'UPDATE palettes SET likes = MAX(0, likes - 1) WHERE id = ?',
        args: [paletteId],
      })
      return NextResponse.json({ success: true, liked: false })
    } else {
      // Add like
      await client.execute({
        sql: 'INSERT INTO palette_likes (paletteId, sessionId) VALUES (?, ?)',
        args: [paletteId, sessionId],
      })
      await client.execute({
        sql: 'UPDATE palettes SET likes = likes + 1 WHERE id = ?',
        args: [paletteId],
      })
      return NextResponse.json({ success: true, liked: true })
    }
  } catch (error) {
    console.error('Palette like POST error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  try {
    const { id: paletteId } = await params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ liked: false })
    }

    const result = await client.execute({
      sql: 'SELECT 1 FROM palette_likes WHERE paletteId = ? AND sessionId = ?',
      args: [paletteId, sessionId],
    })

    return NextResponse.json({ liked: result.rows.length > 0 })
  } catch (error) {
    console.error('Palette like GET error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
