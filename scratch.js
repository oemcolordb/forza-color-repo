const fs = require('fs');
const buffer = fs.readFileSync('public/models/lancer-evo/lancer-evo.glb');
const jsonChunkLength = buffer.readUInt32LE(12);
const jsonChunkType = buffer.readUInt32LE(16);
if (jsonChunkType === 0x4E4F534A) {
  const jsonStr = buffer.toString('utf8', 20, 20 + jsonChunkLength);
  const gltf = JSON.parse(jsonStr);
  const meshNames = gltf.meshes.map(m => m.name);
  console.log('Meshes:', meshNames);
}
