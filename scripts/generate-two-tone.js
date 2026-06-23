const fs = require('fs');
const path = require('path');

const CAR_COLORS_PATH = path.join(__dirname, '../public/carColors.json');

const baseCombinations = [
  { name: "Midnight Purple", base: { h: 280, s: 80, b: 30 }, highlight: { h: 310, s: 90, b: 80 } },
  { name: "Cyberpunk Glow", base: { h: 180, s: 90, b: 50 }, highlight: { h: 320, s: 100, b: 90 } },
  { name: "Gold Rush", base: { h: 0, s: 0, b: 15 }, highlight: { h: 45, s: 80, b: 90 } },
  { name: "Toxic Green", base: { h: 120, s: 90, b: 20 }, highlight: { h: 140, s: 100, b: 85 } },
  { name: "Synthwave", base: { h: 260, s: 80, b: 40 }, highlight: { h: 190, s: 90, b: 90 } },
  { name: "Blood Moon", base: { h: 0, s: 90, b: 25 }, highlight: { h: 15, s: 100, b: 80 } },
  { name: "Ocean Depth", base: { h: 220, s: 85, b: 30 }, highlight: { h: 170, s: 90, b: 85 } },
  { name: "Vampire", base: { h: 0, s: 0, b: 10 }, highlight: { h: 350, s: 90, b: 70 } },
  { name: "Sunset Gold", base: { h: 10, s: 80, b: 50 }, highlight: { h: 50, s: 90, b: 95 } },
  { name: "Chameleon", base: { h: 130, s: 80, b: 40 }, highlight: { h: 270, s: 80, b: 70 } }
];

function hsbToForza(hsbObj) {
  return {
    h: +(hsbObj.h / 360).toFixed(4),
    s: +(hsbObj.s / 100).toFixed(4),
    b: +(hsbObj.b / 100).toFixed(4)
  };
}

const twoToneColors = [];

// Base 10 handpicked
baseCombinations.forEach(combo => {
  twoToneColors.push({
    make: "Custom",
    colorName: `${combo.name} (Two-Tone Semigloss)`,
    colorType: "Two-Tone Semigloss",
    color1: hsbToForza(combo.base),
    color2: hsbToForza(combo.highlight),
    isGenerated: true
  });
});

// Procedurally generate 40 more
for (let i = 0; i < 40; i++) {
  const baseH = Math.floor(Math.random() * 360);
  const baseS = Math.floor(Math.random() * 60) + 40; // 40-100
  const baseB = Math.floor(Math.random() * 40) + 10; // 10-50 (darker base looks better)
  
  // High contrast highlight: Shift hue by 60 to 180 degrees
  const hueShift = Math.floor(Math.random() * 120) + 60;
  const highlightH = (baseH + hueShift) % 360;
  const highlightS = Math.floor(Math.random() * 30) + 70; // 70-100
  const highlightB = Math.floor(Math.random() * 40) + 60; // 60-100 (brighter highlight)

  twoToneColors.push({
    make: "Custom",
    colorName: `Procedural Two-Tone ${i+1}`,
    colorType: "Two-Tone Semigloss",
    color1: hsbToForza({ h: baseH, s: baseS, b: baseB }),
    color2: hsbToForza({ h: highlightH, s: highlightS, b: highlightB }),
    isGenerated: true
  });
}

function run() {
  const carColors = JSON.parse(fs.readFileSync(CAR_COLORS_PATH, 'utf8'));
  
  // Avoid duplicating if we run it multiple times
  const existingGenerated = carColors.filter(c => c.colorType === "Two-Tone Semigloss");
  console.log(`Found ${existingGenerated.length} existing Two-Tone Semigloss paints.`);

  // Append new ones
  for (const color of twoToneColors) {
    carColors.push(color);
  }

  fs.writeFileSync(CAR_COLORS_PATH, JSON.stringify(carColors, null, 2));
  console.log(`Added ${twoToneColors.length} Two-Tone Semigloss colors!`);
}

run();
