import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const BACKGROUNDS_DIR = path.join(process.cwd(), 'public', 'backgrounds', 'japan')
const VALID_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm'])

export async function GET() {
  try {
    if (!fs.existsSync(BACKGROUNDS_DIR)) {
      return NextResponse.json({ files: [] })
    }

    const entries = fs.readdirSync(BACKGROUNDS_DIR)
    const files = entries
      .filter(f => {
        const ext = path.extname(f).toLowerCase()
        return VALID_EXTENSIONS.has(ext)
      })
      .map(f => {
        const ext = path.extname(f).toLowerCase()
        const isVideo = ext === '.mp4' || ext === '.webm'
        return {
          src: `/backgrounds/japan/${f}`,
          type: isVideo ? 'video' : 'image',
        }
      })

    return NextResponse.json({ files })
  } catch {
    return NextResponse.json({ files: [] })
  }
}
