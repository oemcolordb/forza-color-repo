import { NextResponse } from 'next/server'

export async function GET() {
  // Return a static 32-byte AES key for offline storage caching.
  // Using a consistent key allows decrypting previously cached items after a reload.
  // In a real production app, this should be derived securely or fetched from process.env.
  const rawKey = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    rawKey[i] = (i * 7) % 256 // Deterministic sequence
  }

  // Convert to base64
  let binary = ''
  for (let i = 0; i < rawKey.length; i++) {
    binary += String.fromCharCode(rawKey[i])
  }
  const keyBase64 = btoa(binary)

  return NextResponse.json({ keyBase64 })
}
