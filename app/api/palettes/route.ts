import { NextResponse } from 'next/server'
import { getDb, ensureTables } from '@/lib/db/db'
import { v4 as uuidv4 } from 'uuid'
import { checkBotId } from 'botid/server'

export async function GET(request: Request) {
  try {
    await ensureTables()
    const db = getDb()
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'trending' // trending, newest, highest-rated
    const tag = searchParams.get('tag')
    const authorId = searchParams.get('authorId')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    let query = 'SELECT * FROM palettes WHERE isPublic = 1'
    const args: any[] = []

    if (authorId) {
      query = 'SELECT * FROM palettes WHERE authorId = ?'
      args.push(authorId)
    }

    if (tag) {
      query += ` AND tags LIKE ?`
      args.push(`%${tag}%`)
    }

    if (sort === 'highest-rated') {
      query += ` ORDER BY rating_avg DESC, rating_count DESC, createdAt DESC`
    } else if (sort === 'trending') {
      query += ` ORDER BY likes DESC, rating_avg DESC, createdAt DESC`
    } else {
      query += ` ORDER BY createdAt DESC`
    }

    query += ` LIMIT ? OFFSET ?`
    args.push(limit, offset)

    const result = await db.execute({ sql: query, args })

    // Parse JSON fields
    const palettes = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      tags: row.tags ? JSON.parse(row.tags as string) : [],
      colors: row.colors ? JSON.parse(row.colors as string) : [],
      authorId: row.authorId,
      likes: row.likes,
      rating_avg: row.rating_avg !== undefined ? Number(row.rating_avg) : 0,
      rating_count: row.rating_count !== undefined ? Number(row.rating_count) : 0,
      createdAt: row.createdAt,
      isPublic: Boolean(row.isPublic)
    }))

    return NextResponse.json({ palettes })
  } catch (error) {
    console.error('Palettes GET error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const botCheck = await checkBotId()
  if (botCheck.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

  try {
    await ensureTables()
    const db = getDb()
    const body = await request.json()
    const { name, description, tags, colors, authorId } = body

    if (!name || !colors || !authorId) {
      return NextResponse.json({ error: 'Missing required fields (name, colors, authorId)' }, { status: 400 })
    }

    const id = uuidv4()
    const tagsJson = JSON.stringify(tags || [])
    const colorsJson = JSON.stringify(colors)

    await db.execute({
      sql: `INSERT INTO palettes (id, name, description, tags, colors, authorId, likes, isPublic, rating_avg, rating_count)
            VALUES (?, ?, ?, ?, ?, ?, 0, 1, 0.0, 0)`,
      args: [id, name, description || '', tagsJson, colorsJson, authorId],
    })

    return NextResponse.json({
      success: true,
      palette: {
        id, name, description, tags, colors, authorId, likes: 0, rating_avg: 0.0, rating_count: 0
      }
    })
  } catch (error) {
    console.error('Palettes POST error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
