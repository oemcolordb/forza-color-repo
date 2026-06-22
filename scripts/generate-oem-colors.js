const fs = require('fs');
const path = require('path');

const API_KEY = "AIzaSyDvmU-Dgt2K9-6rxb-9z7K4ssxVXM87obc";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${API_KEY}`;

const filePath = path.join(__dirname, '../public/carColors.json');
const colors = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Tally colors by manufacturer
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
  const prompt = `
You are an automotive paint database expert. For the following car manufacturers (some might be obscure makes, tuners, or aftermarket brands), provide genuine OEM paint color names associated with them, or historically accurate/highly realistic colors if specific OEM codes are lost to time.

I need EXACTLY the following number of new colors for each make:
${batch.map(b => `- ${b.make}: ${b.needed} colors`).join('\n')}

For each color, estimate the closest HSB (Hue 0-1, Saturation 0-1, Brightness 0-1) values.
Return ONLY a valid JSON array containing the objects, nothing else. No markdown formatting, no backticks.
Format of each object:
{
  "make": "Manufacturer Name",
  "colorName": "Exact Paint Name",
  "colorType": "Gloss" | "Metallic" | "Matte" | "Pearlescent" | "Metal Flake",
  "h": 0.5,
  "s": 0.5,
  "b": 0.5
}
`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  try {
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON from response:", data.candidates[0].content.parts[0].text);
    return [];
  }
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
        
        // Ensure we don't add duplicates for this make
        if (!existingNames[gc.make]) existingNames[gc.make] = new Set();
        if (existingNames[gc.make].has(gc.colorName.toLowerCase())) continue;

        colors.push({
          make: gc.make,
          model: "",
          year: "2024",
          colorName: gc.colorName,
          colorType: gc.colorType || "Gloss",
          color1: { h: Number(gc.h)||0, s: Number(gc.s)||0, b: Number(gc.b)||0.5 },
          color2: { h: Number(gc.h)||0, s: Number(gc.s)||0, b: Math.max(0, (Number(gc.b)||0.5) - 0.1) },
          source: "OEM-AI"
        });
        
        existingNames[gc.make].add(gc.colorName.toLowerCase());
        addedCount++;
      }
      
      // Save periodically
      fs.writeFileSync(filePath, JSON.stringify(colors, null, 2));
      console.log(`Saved. Total added so far: ${addedCount}`);
      
      // Wait 3 seconds to avoid rate limits
      await new Promise(r => setTimeout(r, 3000));
      
    } catch (e) {
      console.error("Error processing batch:", e.message);
    }
  }

  console.log(`\nFinished! Added ${addedCount} authentic OEM colors.`);
}

run();
