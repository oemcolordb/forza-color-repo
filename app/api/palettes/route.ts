import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client'
import { v4 as uuidv4 } from 'uuid'
import { checkBotId } from 'botid/server'

const client =
  process.env.TURSO_DATABASE_URL &&
  process.env.TURSO_DATABASE_URL !== 'your_turso_database_url_here'
    ? createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN || '',
      })
    : null

export async function GET(request: Request) {
  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'trending' // trending, newest
    const tag = searchParams.get('tag')
    const authorId = searchParams.get('authorId')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    let query = 'SELECT * FROM palettes WHERE isPublic = true'
    const args: any[] = []

    if (authorId) {
      query = 'SELECT * FROM palettes WHERE authorId = ?' // show all for author even if private? Wait, let's keep it simple
      args.push(authorId)
    }

    if (tag) {
      // Tags are stored as JSON array string like '["JDM", "Racing"]'
      query += ` AND tags LIKE ?`
      args.push(`%${tag}%`)
    }

    if (sort === 'trending') {
      query += ` ORDER BY likes DESC, createdAt DESC`
    } else {
      query += ` ORDER BY createdAt DESC`
    }

    query += ` LIMIT ? OFFSET ?`
    args.push(limit, offset)

    const result = await client.execute({ sql: query, args })

    // Parse JSON fields
    const palettes = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      tags: row.tags ? JSON.parse(row.tags as string) : [],
      colors: row.colors ? JSON.parse(row.colors as string) : [],
      authorId: row.authorId,
      likes: row.likes,
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

  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  try {
    const body = await request.json()
    const { name, description, tags, colors, authorId } = body

    if (!name || !colors || !authorId) {
      return NextResponse.json({ error: 'Missing required fields (name, colors, authorId)' }, { status: 400 })
    }

    const id = uuidv4()
    const tagsJson = JSON.stringify(tags || [])
    const colorsJson = JSON.stringify(colors)

    await client.execute({
      sql: `INSERT INTO palettes (id, name, description, tags, colors, authorId, likes, isPublic)
            VALUES (?, ?, ?, ?, ?, ?, 0, true)`,
      args: [id, name, description || '', tagsJson, colorsJson, authorId],
    })

    return NextResponse.json({
      success: true,
      palette: {
        id, name, description, tags, colors, authorId, likes: 0
      }
    })
  } catch (error) {
    console.error('Palettes POST error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
