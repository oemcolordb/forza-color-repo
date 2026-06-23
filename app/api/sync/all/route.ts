import { NextResponse } from 'next/server'
import { getDb, ensureTables } from '@/lib/db/db'
import { auth } from '@/auth'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user?.id || ''

    if (!userId || userId !== session.user?.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    await ensureTables()
    const db = getDb()

    // Fetch favorites
    const favResult = await db.execute({
      sql: 'SELECT car_id FROM favorites WHERE userId = ?',
      args: [userId],
    })
    
    const favorites = favResult.rows.map(row => row.car_id as string)

    // In the future, fetch presets and colorSets here
    return NextResponse.json({
      favorites,
      presets: [],
      colorSets: [],
    })
  } catch (error: any) {
    console.error('Sync all error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
