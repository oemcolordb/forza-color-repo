import { readFileSync } from 'fs'

// Minimal GLB JSON chunk parser — no deps needed
const buf = readFileSync('public/models/lancer-evo/lancer-evo.glb')
const jsonLength = buf.readUInt32LE(12)
const json = JSON.parse(buf.slice(20, 20 + jsonLength).toString('utf8'))

const meshNames = (json.meshes || []).map(m => m.name).filter(Boolean)
const matNames  = (json.materials || []).map(m => m.name).filter(Boolean)
const nodeNames = (json.nodes || [])
  .filter(n => n.mesh !== undefined)
  .map(n => ({ node: n.name, mesh: json.meshes[n.mesh]?.name }))

console.log('\n=== MESH NAMES ===')
meshNames.forEach(n => console.log(' ', n))
console.log('\n=== MATERIAL NAMES ===')
matNames.forEach(n => console.log(' ', n))
console.log('\n=== NODE→MESH MAPPING (first 40) ===')
nodeNames.slice(0, 40).forEach(({ node, mesh }) => console.log(`  node:"${node}"  mesh:"${mesh}"`))
