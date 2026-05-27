import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // Get user info from headers or session
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // We use a mix of a server secret and the IP/device info to generate a unique key
    const serverSecret = process.env.ENCRYPTION_SECRET || 'forza-color-universe-super-secret-key-2024';

    // Hash them together to create a 32-byte (256-bit) secure key
    const hash = crypto.createHash('sha256');
    hash.update(serverSecret + ip);
    const keyBuffer = hash.digest();

    // Return base64 encoded raw key
    return NextResponse.json({ keyBase64: keyBuffer.toString('base64') });
  } catch (error) {
    console.error('Key generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate key' }, { status: 500 });
  }
}
