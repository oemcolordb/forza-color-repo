import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'tuneforge-cars-full.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const cars = JSON.parse(fileContents)

    return NextResponse.json(cars)
  } catch (error) {
    console.error('Error loading car data:', error)
    return NextResponse.json({ error: 'Failed to load car data' }, { status: 500 })
  }
}
