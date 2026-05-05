import { getDb } from '@/app/lib/db'
import { NextResponse } from 'next/server'

export const POST = async () => {
  const client = getDb()

  try {
    const result = await client.execute('CREATE TABLE IF NOT EXISTS todos (description TEXT);')
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Todos POST error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
