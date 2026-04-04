#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function ts() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

const cwd = process.cwd();
const existingPath = path.resolve(cwd, 'carColors.json');
const mergedPath = path.resolve(cwd, 'carColors_merged_dryrun.json');

if (!fs.existsSync(mergedPath)) {
  console.error('Missing merged file:', mergedPath);
  process.exit(1);
}
if (!fs.existsSync(existingPath)) {
  console.error('Missing existing carColors.json:', existingPath);
  process.exit(1);
}

const backupPath = path.resolve(cwd, `carColors.json.bak.${ts()}`);
try {
  fs.copyFileSync(existingPath, backupPath);
  fs.copyFileSync(mergedPath, existingPath);
  const arr = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
  console.log('Backup created:', path.basename(backupPath));
  console.log('Updated carColors.json count:', arr.length);
  console.log('Sample entry:', JSON.stringify(arr.slice(0,1), null, 2));
} catch (err) {
  console.error('Error applying merge:', err.message);
  process.exit(1);
}
