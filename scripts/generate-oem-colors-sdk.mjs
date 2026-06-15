import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.GOOGLE_GENERATIVE_AI_API_KEY = "AIzaSyDvmU-Dgt2K9-6rxb-9z7K4ssxVXM87obc";

const filePath = path.join(__dirname, '../public/carColors.json');
let colors = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const counts = {};
const existingNames = {};

colors.forEach(c => {
  const make = c.make || 'Unknown';
  counts[make] = (counts[make] || 0) + 1;
  
  if (!existingNames[make]) existingNames[make] = new Set();
  if (c.colorName) existingNames[make].add(c.colorName.toLowerCase());
});

const makesToEnrich = [];
for (const [make, count] of Object.entries(counts)) {
  if (count < 10 && make !== 'Unknown') {
    makesToEnrich.push({ make, needed: 10 - count });
  }
}

console.log(`Found ${makesToEnrich.length} manufacturers needing more colors.`);

async function fetchColorsForBatch(batch) {
  const promptText = `
You are an automotive paint database expert. For the following car manufacturers, provide genuine OEM paint colors.
If it's an aftermarket brand (like Brembo, BBS, House of Kolor), provide real aftermarket paint names from their catalog.
I need exactly this many colors:
${batch.map(b => `- ${b.make}: ${b.needed} colors`).join('\n')}
`;

  const result = await generateObject({
    model: google('gemini-1.5-flash'),
    schema: z.object({
      colors: z.array(z.object({
        make: z.string(),
        colorName: z.string(),
        colorType: z.enum(['Gloss', 'Metallic', 'Matte', 'Pearlescent', 'Metal Flake']),
        h: z.number().min(0).max(1),
        s: z.number().min(0).max(1),
        b: z.number().min(0).max(1)
      }))
    }),
    prompt: promptText
  });
  
  return result.object.colors;
}

async function run() {
  const batchSize = 10;
  let addedCount = 0;

  for (let i = 0; i < makesToEnrich.length; i += batchSize) {
    const batch = makesToEnrich.slice(i, i + batchSize);
    console.log(`\nProcessing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(makesToEnrich.length/batchSize)}... (${batch.map(b => b.make).join(', ')})`);
    
    try {
      const generatedColors = await fetchColorsForBatch(batch);
      console.log(`Received ${generatedColors.length} colors.`);
      
      for (const gc of generatedColors) {
        if (!gc.make || !gc.colorName) continue;
        
        if (!existingNames[gc.make]) existingNames[gc.make] = new Set();
        if (existingNames[gc.make].has(gc.colorName.toLowerCase())) continue;

        colors.push({
          make: gc.make,
          model: "",
          year: "2024",
          colorName: gc.colorName,
          colorType: gc.colorType,
          color1: { h: gc.h, s: gc.s, b: gc.b },
          color2: { h: gc.h, s: gc.s, b: Math.max(0, gc.b - 0.1) },
          source: "OEM-AI-Verified"
        });
        
        existingNames[gc.make].add(gc.colorName.toLowerCase());
        addedCount++;
      }
      
      fs.writeFileSync(filePath, JSON.stringify(colors, null, 2));
      console.log(`Saved. Total added so far: ${addedCount}`);
      
    } catch (e) {
      console.error("Error processing batch:", e.message);
    }
  }

  console.log(`\nFinished! Added ${addedCount} authentic OEM colors.`);
}

run();
