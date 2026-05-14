import { createClient } from '@libsql/client'
import { NextResponse } from 'next/server'

const client =
  process.env.TURSO_DATABASE_URL &&
  process.env.TURSO_DATABASE_URL !== 'your_turso_database_url_here'
    ? createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN || '',
      })
    : null

export const POST = async () => {
  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  try {
    const result = await client.execute('CREATE TABLE IF NOT EXISTS todos (description TEXT);')
    return NextResponse.json({ success: true, result })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
