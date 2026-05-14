/**
 * scripts/parse-dump.js
 * 
 * Parses the raw community color dump into a structured JSON file.
 * Usage: node scripts/parse-dump.js < path_to_raw_text.txt
 */

const fs = require('fs');
const path = require('path');

function parseLine(line) {
  // Regex to match manufacturer, color name, paint type, and 3 or 6 HSB values
  // Handles 'L' and 'R' suffixes and occasional messy spacing
  const regex = /^(.*?)\s+(.*?)\s+(Normal|Metal Flake|Two-Tone Semigloss|Two-Tone Matte|Matte|Semigloss|Aluminum|Metal|Two-Tone Polished|Gloss)\s+([\d\.]+)\s*[LR]?\s+([\d\.]+)\s*[LR]?\s+([\d\.]+)\s*[LR]?\s*(?:([\d\.]+)\s*[LR]?\s+([\d\.]+)\s*[LR]?\s+([\d\.]+)\s*[LR]?)?/i;
  
  const match = line.match(regex);
  if (!match) return null;

  const [_, make, colorName, paintType, h1, s1, b1, h2, s2, b2] = match;

  return {
    make: make.trim(),
    colorName: colorName.trim(),
    paintType: paintType.trim(),
    color1: {
      h: parseFloat(h1),
      s: parseFloat(s1),
      b: parseFloat(b1)
    },
    color2: h2 ? {
      h: parseFloat(h2),
      s: parseFloat(s2),
      b: parseFloat(b2)
    } : {
      h: parseFloat(h1),
      s: parseFloat(s1),
      b: parseFloat(b1)
    }
  };
}

async function main() {
  const inputPath = path.join(process.cwd(), 'color_dump.txt');
  if (!fs.existsSync(inputPath)) {
    console.error('Please create color_dump.txt in the root directory with the raw text.');
    return;
  }

  const rawText = fs.readFileSync(inputPath, 'utf8');
  const lines = rawText.split('\n');
  const results = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const parsed = parseLine(line);
    if (parsed) {
      results.push(parsed);
    }
  }

  const outputPath = path.join(process.cwd(), 'app/data/manufacturer-colors.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Successfully parsed ${results.length} colors into ${outputPath}`);
}

main();
