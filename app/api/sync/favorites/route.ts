import { NextResponse } from 'next/server'
import { getDb, ensureTables } from '@/lib/db/db'
import { auth } from '@/auth'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { userId, favorites } = await request.json()

    if (userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    await ensureTables()
    const db = getDb()

    // We can do a simple transaction to replace favorites, or smart upsert.
    // For now, delete existing and insert new (simple sync strategy).
    // In a production app you might want to merge them more intelligently.
    
    await db.execute({
      sql: 'DELETE FROM favorites WHERE userId = ?',
      args: [userId],
    })

    if (favorites && favorites.length > 0) {
      // Build batch inserts
      const stmts = favorites.map((car_id: string) => ({
        sql: 'INSERT INTO favorites (id, car_id, userId) VALUES (?, ?, ?)',
        args: [`${userId}-${car_id}`, car_id, userId]
      }))
      await db.batch(stmts, 'write')
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Sync favorites POST error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
