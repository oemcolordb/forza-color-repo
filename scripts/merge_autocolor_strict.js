#!/usr/bin/env node
// scripts/merge_autocolor_strict.js
// Reads carColors_autocolor_strict.json and carColors.json, identifies new colors
// by normalized color name, converts hex to HSB when available, writes new-only
// and merged dry-run files.

const fs = require('fs').promises;
const path = require('path');

function parseArgs() {
  const raw = process.argv.slice(2);
  const get = (k) => {
    const i = raw.indexOf(k);
    if (i !== -1) return raw[i + 1] && !raw[i + 1].startsWith('--') ? raw[i + 1] : true;
    return null;
  };
  return {
    autocolorFile: get('--autocolor') || 'carColors_autocolor_strict.json',
    existingFile: get('--existing') || 'carColors.json',
    newOutput: get('--newOutput') || 'carColors_autocolor_newonly.json',
    mergedOutput: get('--mergedOutput') || 'carColors_merged_dryrun.json',
  };
}

function normalizeName(s) {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ') // remove parenthetical
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hexToHsb(hex) {
  if (!hex) return null;
  const h = hex.replace('#', '').trim();
  if (!(h.length === 3 || h.length === 6)) return null;
  const expand = (c) => (c.length === 1 ? c + c : c);
  const r = parseInt(expand(h.slice(0, h.length === 3 ? 1 : 2)), 16) / 255;
  const g = parseInt(expand(h.slice(h.length === 3 ? 1 : 2, h.length === 3 ? 2 : 4)), 16) / 255;
  const b = parseInt(expand(h.slice(h.length === 3 ? 2 : 4, h.length === 3 ? 3 : 6)), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  if (delta === 0) hue = 0;
  else if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  hue = Math.abs(hue * 60);
  if (hue < 0) hue += 360;
  const sat = max === 0 ? 0 : delta / max;
  const val = max;
  return { h: Number((hue / 360).toFixed(4)), s: Number(sat.toFixed(4)), b: Number(val.toFixed(4)) };
}

async function main() {
  const opts = parseArgs();
  const autPath = path.resolve(process.cwd(), opts.autocolorFile);
  const existingPath = path.resolve(process.cwd(), opts.existingFile);
  const newOut = path.resolve(process.cwd(), opts.newOutput);
  const mergedOut = path.resolve(process.cwd(), opts.mergedOutput);

  const [autText, existingText] = await Promise.all([
    fs.readFile(autPath, 'utf8'),
    fs.readFile(existingPath, 'utf8'),
  ]);

  const aut = JSON.parse(autText);
  const existing = JSON.parse(existingText);

  const existingNames = new Set(existing.map(e => normalizeName(e.colorName)).filter(Boolean));

  const newOnly = [];
  for (const a of aut) {
    const candidate = a.exactColorName || a.title || a.handle || '';
    const n = normalizeName(candidate);
    if (!n) continue;
    if (existingNames.has(n)) continue;

    const hex = (a.hex || '').trim();
    const color1 = hex ? hexToHsb(hex) : null;

    const newEntry = {
      make: a.vendor || '',
      model: '',
      year: null,
      colorName: a.exactColorName || a.title || '',
      colorType: 'Unknown',
      color1: color1,
      color2: null,
    };
    newOnly.push(newEntry);
    existingNames.add(n);
  }

  const merged = existing.concat(newOnly);

  await Promise.all([
    fs.writeFile(newOut, JSON.stringify(newOnly, null, 2), 'utf8'),
    fs.writeFile(mergedOut, JSON.stringify(merged, null, 2), 'utf8'),
  ]);

  console.log('existingCount:', existing.length);
  console.log('autocolorCount:', aut.length);
  console.log('newOnlyCount:', newOnly.length);
  console.log('mergedCount:', merged.length);
  console.log('wrote new-only ->', path.relative(process.cwd(), newOut));
  console.log('wrote merged-dryrun ->', path.relative(process.cwd(), mergedOut));
}

main().catch(err => { console.error(err); process.exit(1); });
