const fs = require('fs');
const path = require('path');

// Read the original colorData file
const colorDataPath = path.join(__dirname, '../services/colorData.ts');
const content = fs.readFileSync(colorDataPath, 'utf8');

// Extract the colorData array
const match = content.match(/const colorData = (\[[\s\S]*\]);/);
if (!match) {
  console.error('Could not find colorData array in file');
  process.exit(1);
}

const colorDataString = match[1];
const colorData = eval(colorDataString); // Parse the array

console.log(`Found ${colorData.length} colors`);

// Split into chunks of 1000 items
const CHUNK_SIZE = 1000;
const chunks = [];

for (let i = 0; i < colorData.length; i += CHUNK_SIZE) {
  chunks.push(colorData.slice(i, i + CHUNK_SIZE));
}

console.log(`Split into ${chunks.length} chunks`);

// Create chunks directory
const chunksDir = path.join(__dirname, '../services/chunks');
if (!fs.existsSync(chunksDir)) {
  fs.mkdirSync(chunksDir, { recursive: true });
}

// Write each chunk to a separate file
chunks.forEach((chunk, index) => {
  const chunkContent = `export const colorDataChunk${index} = ${JSON.stringify(chunk, null, 2)};`;
  const chunkPath = path.join(chunksDir, `chunk${index}.ts`);
  fs.writeFileSync(chunkPath, chunkContent);
  console.log(`Written chunk ${index} with ${chunk.length} items`);
});

// Create index file that imports all chunks
const indexContent = `import type { CarColor } from '../types';
${chunks.map((_, index) => `import { colorDataChunk${index} } from './chunk${index}';`).join('\n')}

export const colorData: CarColor[] = [
${chunks.map((_, index) => `  ...colorDataChunk${index}`).join(',\n')}
];

export default colorData;
`;

fs.writeFileSync(path.join(chunksDir, 'index.ts'), indexContent);

// Create a new lightweight colorData.ts that imports from chunks
const newColorDataContent = `export { colorData } from './chunks/index';
export default { colorData } from './chunks/index';
`;

// Backup original file
fs.copyFileSync(colorDataPath, colorDataPath + '.backup');

// Write new colorData file
fs.writeFileSync(colorDataPath, newColorDataContent);

console.log('Color data splitting complete!');
console.log('Original file backed up as colorData.ts.backup');
console.log(`Created ${chunks.length} chunk files in services/chunks/`);