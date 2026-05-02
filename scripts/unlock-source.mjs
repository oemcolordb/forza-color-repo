import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const passphrase = (() => {
  const idx = process.argv.indexOf('--key')
  if (idx === -1 || !process.argv[idx + 1]) {
    console.error('Usage: node scripts/unlock-source.mjs --key "your-passphrase"')
    process.exit(1)
  }
  return process.argv[idx + 1]
})()

function decryptFile(encPath, pass) {
  const buf = fs.readFileSync(encPath)
  const salt = buf.subarray(0, 32)
  const iv   = buf.subarray(32, 48)
  const tag  = buf.subarray(48, 64)
  const ct   = buf.subarray(64)
  const key  = crypto.scryptSync(pass, salt, 32)
  const d = crypto.createDecipheriv('aes-256-gcm', key, iv)
  d.setAuthTag(tag)
  return Buffer.concat([d.update(ct), d.final()])
}

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    return [full]
  })
}

const encFiles = [
  ...walk(path.join(ROOT, 'app')),
  ...walk(path.join(ROOT, 'scripts')),
].filter(f => f.endsWith('.enc'))

if (encFiles.length === 0) {
  console.log('No .enc files found. Nothing to unlock.')
  process.exit(0)
}

let count = 0
for (const enc of encFiles) {
  const out = enc.slice(0, -4)
  try {
    fs.writeFileSync(out, decryptFile(enc, passphrase))
    console.log(`  unlocked: ${path.relative(ROOT, out)}`)
    count++
  } catch {
    console.error(`  FAILED (wrong key or corrupt): ${path.relative(ROOT, enc)}`)
    process.exit(1)
  }
}

console.log(`\nDone. ${count} files restored.`)
