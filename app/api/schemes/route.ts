import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'trending'
    const search = searchParams.get('search') || ''

    let query = 'SELECT * FROM schemes WHERE 1=1'
    const params: any[] = []

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    switch (filter) {
      case 'trending':
        query += ' ORDER BY (downloads * 0.7 + rating * ratingCount * 0.3) DESC'
        break
      case 'recent':
        query += ' ORDER BY createdAt DESC'
        break
      case 'top':
        query += ' ORDER BY rating DESC, ratingCount DESC'
        break
    }

    query += ' LIMIT 50'

    const result = await client.execute({ sql: query, args: params })

    return NextResponse.json(result.rows)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, colors, tags, authorId } = body

    const result = await client.execute({
      sql: `INSERT INTO schemes (name, description, colors, tags, authorId, rating, ratingCount, downloads, createdAt)
            VALUES (?, ?, ?, ?, ?, 0, 0, 0, datetime('now'))`,
      args: [name, description, JSON.stringify(colors), JSON.stringify(tags), authorId],
    })

    return NextResponse.json({ success: true, id: result.lastInsertRowid })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
