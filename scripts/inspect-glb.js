const fs = require('fs');

const glbBuffer = fs.readFileSync('public/models/lancer-evo/lancer-evo.glb');
// The GLB header is 12 bytes
const magic = glbBuffer.toString('utf8', 0, 4);
if (magic !== 'glTF') {
  console.log('Not a valid GLB');
  process.exit(1);
}

const version = glbBuffer.readUInt32LE(4);
const length = glbBuffer.readUInt32LE(8);
console.log('GLB Version:', version, 'Length:', length);

const chunkOffset = 12;
const chunkLength = glbBuffer.readUInt32LE(chunkOffset);
const chunkType = glbBuffer.toString('utf8', chunkOffset + 4, chunkOffset + 8);

if (chunkType === 'JSON') {
  const jsonBuffer = glbBuffer.slice(chunkOffset + 8, chunkOffset + 8 + chunkLength);
  const json = JSON.parse(jsonBuffer.toString('utf8'));
  console.log('JSON Images:', json.images);
  console.log('JSON Textures:', json.textures);
}
