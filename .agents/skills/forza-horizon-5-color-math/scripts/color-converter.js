#!/usr/bin/env node

/**
 * Forza Horizon 5 Color Converter Utility
 * Part of the Forza Horizon 5 Color Math Skill
 * 
 * Supports converting standard Hex/RGB colors to Forza Horizon 5 sub-tick HSB values,
 * and reverse-engineering sub-tick HSB values back to Hex/RGB.
 */

const fs = require('fs');
const path = require('path');

// Helper to convert standard HSB to RGB
function hsbToRgb(h, s, b) {
  // h, s, b are in [0, 1]
  const c = b * s;
  const hp = h * 6;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const m = b - c;
  
  let r = 0, g = 0, bl = 0;
  
  if (hp >= 0 && hp < 1) {
    r = c; g = x; bl = 0;
  } else if (hp >= 1 && hp < 2) {
    r = x; g = c; bl = 0;
  } else if (hp >= 2 && hp < 3) {
    r = 0; g = c; bl = x;
  } else if (hp >= 3 && hp < 4) {
    r = 0; g = x; bl = c;
  } else if (hp >= 4 && hp < 5) {
    r = x; g = 0; bl = c;
  } else if (hp >= 5 && hp <= 6) {
    r = c; g = 0; bl = x;
  }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((bl + m) * 255)
  };
}

// Helper to convert RGB to HSB
function rgbToHsb(r, g, b) {
  // r, g, b are in [0, 255]
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const diff = max - min;
  
  let h = 0;
  if (diff !== 0) {
    if (max === rNorm) {
      h = (gNorm - bNorm) / diff + (gNorm < bNorm ? 6 : 0);
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / diff + 2;
    } else if (max === bNorm) {
      h = (rNorm - gNorm) / diff + 4;
    }
    h /= 6;
  }
  
  const s = max === 0 ? 0 : diff / max;
  const brightness = max;
  
  return { h, s, b: brightness };
}

// Helper to parse hex string
function parseHex(hex) {
  const cleanHex = hex.replace(/^#/, '');
  if (cleanHex.length !== 6) {
    throw new Error('Hex color must be exactly 6 characters (e.g. #46523C or 46523C)');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    throw new Error('Invalid hexadecimal characters');
  }
  return { r, g, b };
}

// Quantize true float [0, 1] to Forza UI and Tick
function trueToSubTick(v) {
  const n = Math.round(200 * v);
  const valUI = Math.floor(n / 2) / 100;
  const tick = (n % 2 === 0) ? 'L' : 'R';
  return {
    valUI,
    tick,
    formatted: `${valUI.toFixed(2)}${tick}`
  };
}

// Restore Forza UI + Tick to true float
function subTickToTrue(val, tick) {
  const offset = tick === 'R' ? 0.005 : 0.000;
  return val + offset;
}

// Parse sub-tick input string (e.g. "0.26L" or "0.26 L" or "0.55")
function parseSubTickStr(str) {
  const clean = str.trim().replace(/\s+/g, '');
  const match = clean.match(/^([0-9.]+)([LRlr])?$/);
  if (!match) {
    throw new Error(`Invalid sub-tick format: "${str}". Must be a decimal followed by L or R (e.g. "0.26L")`);
  }
  const val = parseFloat(match[1]);
  const tick = match[2] ? match[2].toUpperCase() : 'L';
  return { val, tick };
}

function printUsage() {
  console.log(`
Forza Horizon 5 Color Converter CLI
===================================
Usage:
  node color-converter.js to-forza <hex_or_rgb>
    Converts a Hex color (e.g., #46523C) or RGB values (e.g., "70 82 60") to FH5 HSB UI sliders.
    Example: node color-converter.js to-forza #46523C
    Example: node color-converter.js to-forza 70 82 60

  node color-converter.js from-forza <h_ui> <s_ui> <b_ui>
    Converts FH5 HSB UI sliders to Hex and RGB. UI sliders can be specified with L/R suffixes.
    Example: node color-converter.js from-forza 0.26L 0.27L 0.32L
    Example: node color-converter.js from-forza 0.26 0.27 0.32  (defaults to Left tick)

  node color-converter.js match <hex_or_rgb> <palette_file.json>
    Finds the closest color in a JSON color palette file.
  `);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const mode = args[0].toLowerCase();

  try {
    if (mode === 'to-forza') {
      let r, g, b;
      if (args.length === 2) {
        // Hex representation
        const parsed = parseHex(args[1]);
        r = parsed.r;
        g = parsed.g;
        b = parsed.b;
      } else if (args.length === 4) {
        // RGB representation
        r = parseInt(args[1], 10);
        g = parseInt(args[2], 10);
        b = parseInt(args[3], 10);
      } else {
        throw new Error('Please specify either a HEX color (e.g. #46523C) or RGB values (e.g. 70 82 60)');
      }

      if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 || isNaN(r) || isNaN(g) || isNaN(b)) {
        throw new Error('RGB values must be integers between 0 and 255');
      }

      const hsb = rgbToHsb(r, g, b);
      const hSub = trueToSubTick(hsb.h);
      const sSub = trueToSubTick(hsb.s);
      const bSub = trueToSubTick(hsb.b);

      console.log(`\nInput RGB: rgb(${r}, ${g}, ${b})`);
      console.log(`Input HEX: #${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`);
      console.log(`\n--- HSB Continuous (Unquantized) ---`);
      console.log(`Hue:        ${(hsb.h * 360).toFixed(2)}° (Float: ${hsb.h.toFixed(6)})`);
      console.log(`Saturation: ${(hsb.s * 100).toFixed(2)}% (Float: ${hsb.s.toFixed(6)})`);
      console.log(`Brightness: ${(hsb.b * 100).toFixed(2)}% (Float: ${hsb.b.toFixed(6)})`);
      console.log(`\n--- FH5 UI Slider Settings ---`);
      console.log(`H: ${hSub.formatted}`);
      console.log(`S: ${sSub.formatted}`);
      console.log(`B: ${bSub.formatted}`);
      console.log(`\nValues to enter in Forza:`);
      console.log(`  Hue Slider:        ${hSub.valUI.toFixed(2)}  ->  Move slider to ${hSub.valUI.toFixed(2)}, then tick ${hSub.tick === 'L' ? 'LEFT' : 'RIGHT'}`);
      console.log(`  Saturation Slider: ${sSub.valUI.toFixed(2)}  ->  Move slider to ${sSub.valUI.toFixed(2)}, then tick ${sSub.tick === 'L' ? 'LEFT' : 'RIGHT'}`);
      console.log(`  Brightness Slider: ${bSub.valUI.toFixed(2)}  ->  Move slider to ${bSub.valUI.toFixed(2)}, then tick ${bSub.tick === 'L' ? 'LEFT' : 'RIGHT'}`);
    } 
    
    else if (mode === 'from-forza') {
      if (args.length < 4) {
        throw new Error('Please specify H, S, and B slider settings (e.g. 0.26L 0.27L 0.32L)');
      }

      const hParsed = parseSubTickStr(args[1]);
      const sParsed = parseSubTickStr(args[2]);
      const bParsed = parseSubTickStr(args[3]);

      const hTrue = subTickToTrue(hParsed.val, hParsed.tick);
      const sTrue = subTickToTrue(sParsed.val, sParsed.tick);
      const bTrue = subTickToTrue(bParsed.val, bParsed.tick);

      const rgb = hsbToRgb(hTrue, sTrue, bTrue);
      const hexStr = `#${rgb.r.toString(16).padStart(2,'0')}${rgb.g.toString(16).padStart(2,'0')}${rgb.b.toString(16).padStart(2,'0')}`.toUpperCase();

      console.log(`\nInput FH5 Settings: H=${args[1]}, S=${args[2]}, B=${args[3]}`);
      console.log(`\n--- Reconstructed Floating-Points ---`);
      console.log(`Hue (True):        ${hTrue.toFixed(4)}  (Deg: ${(hTrue * 360).toFixed(2)}°)`);
      console.log(`Saturation (True): ${sTrue.toFixed(4)}  (Pct: ${(sTrue * 100).toFixed(2)}%)`);
      console.log(`Brightness (True): ${bTrue.toFixed(4)}  (Pct: ${(bTrue * 100).toFixed(2)}%)`);
      console.log(`\n--- Output Colors ---`);
      console.log(`RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
      console.log(`HEX: ${hexStr}`);
    } 
    
    else {
      throw new Error(`Unknown mode: ${mode}`);
    }
  } catch (err) {
    console.error(`\nError: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
