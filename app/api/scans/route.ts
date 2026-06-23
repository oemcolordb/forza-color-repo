import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/db'
import { checkBotId } from 'botid/server'

const client = getDb()

export async function GET(request: Request) {
  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const result = await client.execute({
      sql: 'SELECT id, userId, imageName, extractedColors, matches, createdAt FROM scans WHERE userId = ? ORDER BY createdAt DESC LIMIT 50',
      args: [userId],
    })

    return NextResponse.json(result.rows)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const botCheck = await checkBotId()
  if (botCheck.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  try {
    const body = await request.json()
    const { userId, imageName, extractedColors, matches, imageData } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const result = await client.execute({
      sql: `INSERT INTO scans (userId, imageName, extractedColors, matches, imageData, createdAt)
            VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        userId,
        imageName,
        JSON.stringify(extractedColors),
        JSON.stringify(matches),
        imageData,
      ],
    })

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Scan saved successfully',
    })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  try {
    const { searchParams } = new URL(request.url)
    const scanId = searchParams.get('scanId')
    const userId = searchParams.get('userId')

    if (!scanId || !userId) {
      return NextResponse.json({ error: 'scanId and userId required' }, { status: 400 })
    }

    await client.execute({
      sql: 'DELETE FROM scans WHERE id = ? AND userId = ?',
      args: [scanId, userId],
    })

    return NextResponse.json({ success: true, message: 'Scan deleted' })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
