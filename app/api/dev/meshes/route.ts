import { readFileSync } from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

export async function GET() {
  try {
    const p = path.join(process.cwd(), 'public/models/lancer-evo/lancer-evo.glb')
    const buf = readFileSync(p)
    const jsonLength = buf.readUInt32LE(12)
    const json = JSON.parse(buf.slice(20, 20 + jsonLength).toString('utf8'))
    
    const meshNames = (json.meshes || []).map((m: any) => m.name).filter(Boolean)
    const nodeNames = (json.nodes || [])
      .filter((n: any) => n.mesh !== undefined)
      .map((n: any) => ({ node: n.name, mesh: json.meshes[n.mesh]?.name }))

    return NextResponse.json({ meshNames, nodeNames })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
