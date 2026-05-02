import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'data', 'fh5-locations.json')
    const raw = readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw)
    return NextResponse.json(data)
  } catch (err) {
    console.error('[fh5-locations] Failed to read locations file:', err)
    return NextResponse.json(
      { error: 'Failed to load location data' },
      { status: 500 }
    )
  }
}
