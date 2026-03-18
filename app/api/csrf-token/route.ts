import { NextResponse } from 'next/server';
import { generateCsrfToken } from '@/app/lib/csrf';

/**
 * GET /api/csrf-token
 * Returns a new CSRF token for the client to use in subsequent requests
 */
export async function GET() {
  const token = generateCsrfToken();
  
  return NextResponse.json({
    token,
    expiresIn: 3600 // Token valid for 1 hour
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
}
