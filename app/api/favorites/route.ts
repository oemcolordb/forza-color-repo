import { NextRequest, NextResponse } from 'next/server'
import { getDb, ensureTables } from '../../../lib/db'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    await ensureTables()
    const db = getDb()
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')

    if (!sessionId && !userId) {
      return NextResponse.json({ error: 'sessionId or userId required' }, { status: 400 })
    }

    let result;
    // If a user is logged in, fetch their cloud favorites. Otherwise, fetch the local session.
    if (userId) {
      result = await db.execute({
        sql: 'SELECT color_data FROM favorites WHERE userId = ? ORDER BY created_at DESC',
        args: [userId]
      })
    } else {
      result = await db.execute({
        sql: 'SELECT color_data FROM favorites WHERE sessionId = ? AND userId IS NULL ORDER BY created_at DESC',
        args: [sessionId]
      })
    }

    const favorites = result.rows.map(row => JSON.parse(row.color_data as string))

    return NextResponse.json({ favorites })
  } catch (error: any) {
    console.error('Favorites GET error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTables()
    const db = getDb()
    const body = await request.json()
    const { sessionId, userId, favorites } = body

    if (!sessionId && !userId) {
      return NextResponse.json({ error: 'sessionId or userId required' }, { status: 400 })
    }

    // The frontend sends the entire array of favorites to sync.
    if (favorites && Array.isArray(favorites)) {
      // 1. Clear existing favorites for this user/session
      if (userId) {
        await db.execute({
          sql: 'DELETE FROM favorites WHERE userId = ?',
          args: [userId]
        })
      } else {
        await db.execute({
          sql: 'DELETE FROM favorites WHERE sessionId = ? AND userId IS NULL',
          args: [sessionId]
        })
      }

      // 2. Insert the new favorites row by row
      for (const fav of favorites) {
        const id = randomUUID()
        const car_id = fav.colorId || fav.id || 'unknown'
        const color_data = JSON.stringify(fav)

        await db.execute({
          sql: 'INSERT INTO favorites (id, car_id, sessionId, userId, color_data) VALUES (?, ?, ?, ?, ?)',
          args: [id, car_id, sessionId || null, userId || null, color_data]
        })
      }
    }

    return NextResponse.json({ success: true, message: 'Favorites synced successfully' })
  } catch (error: any) {
    console.error('Favorites POST error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await ensureTables()
    const db = getDb()
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')
    const colorId = searchParams.get('colorId')

    if (!colorId) {
      return NextResponse.json({ error: 'colorId required' }, { status: 400 })
    }

    if (userId) {
      await db.execute({
        sql: 'DELETE FROM favorites WHERE userId = ? AND car_id = ?',
        args: [userId, colorId]
      })
    } else if (sessionId) {
      await db.execute({
        sql: 'DELETE FROM favorites WHERE sessionId = ? AND car_id = ? AND userId IS NULL',
        args: [sessionId, colorId]
      })
    }

    return NextResponse.json({ success: true, message: 'Favorite removed' })
  } catch (error: any) {
    console.error('Favorites DELETE error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
