import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /\.git/,
  /\.venv/,
  /\.enc$/,
  /\.d\.ts$/,
  /next\.config\./,
  /next-env\.d\.ts/,
  /jest\.config\./,
  /jest\.setup\./,
  /eslint\.config\./,
  /postcss\.config\./,
  /tailwind\.config\./,
  /prettier\.config\./,
]

const passphrase = (() => {
  const idx = process.argv.indexOf('--key')
  if (idx === -1 || !process.argv[idx + 1]) {
    console.error('Usage: node scripts/lock-source.mjs --key "your-passphrase"')
    process.exit(1)
  }
  return process.argv[idx + 1]
})()

function encryptFile(src, pass) {
  const plain = fs.readFileSync(src)
  const salt = crypto.randomBytes(32)
  const key = crypto.scryptSync(pass, salt, 32)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ct = Buffer.concat([cipher.update(plain), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([salt, iv, tag, ct])
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    return [full]
  })
}

const candidates = [
  ...walk(path.join(ROOT, 'app')),
  ...walk(path.join(ROOT, 'scripts')),
].filter(f => {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/')
  return /\.(ts|tsx|js|mjs)$/.test(f) && !EXCLUDE_PATTERNS.some(p => p.test(rel))
})

let locked = 0
for (const src of candidates) {
  try {
    fs.writeFileSync(src + '.enc', encryptFile(src, passphrase))
    console.log(`  locked: ${path.relative(ROOT, src)}`)
    locked++
  } catch (e) {
    console.warn(`  skip: ${path.relative(ROOT, src)} — ${e.message}`)
  }
}

console.log(`\nDone. ${locked} files locked.`)
