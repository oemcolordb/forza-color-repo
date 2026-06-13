import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';
import { withRateLimit } from '@/app/lib/rateLimit';

function normalizeUrlFromBlobResponse(blob: any): string {
  return blob?.url ?? blob?.publicUrl ?? blob?.pathname ?? blob?.key ?? '';
}

async function handler(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Missing filename' }, { status: 400 });
  }

  // Always materialize the payload once so we can reuse it for Blob OR local fallback.
  let buffer: Buffer;
  try {
    buffer = Buffer.from(await request.arrayBuffer());
  } catch (error) {
    console.error('Failed to read upload body:', error);
    return NextResponse.json({ error: 'Missing or invalid request body' }, { status: 400 });
  }

  // Try Vercel Blob first if token is available
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob');
      const blob = await put(filename, buffer, {
        access: 'public',
      });

      const url = normalizeUrlFromBlobResponse(blob);
      if (!url) {
        console.error('Vercel Blob response did not include a usable url field:', {
          filename,
          tokenPresent: !!process.env.BLOB_READ_WRITE_TOKEN,
          blob,
          derivedUrl: url,
          availableKeys: Object.keys(blob || {}),
        });
        return NextResponse.json({ error: 'Upload succeeded but no usable public URL was returned' }, { status: 500 });
      }

      // Normalize response so the frontend can always rely on `url`.
      return NextResponse.json({ ...blob, url });
    } catch (error) {
      console.error('Vercel Blob upload failed, falling back to local storage:', {
        filename,
        tokenPresent: !!process.env.BLOB_READ_WRITE_TOKEN,
        error,
      });
    }
  } else {
    console.log('BLOB_READ_WRITE_TOKEN not set; using local upload fallback:', { filename });
  }

  // Local fallback: save to /tmp/uploads/ (writable on Vercel)
  try {
    const uploadsDir = path.join(os.tmpdir(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Add timestamp prefix to avoid collisions
    const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(uploadsDir, safeFilename);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      url: `/api/community/uploads/${safeFilename}`,
      pathname: `/tmp/uploads/${safeFilename}`,
    });
  } catch (error) {
    console.error('Local upload fallback failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export const POST = withRateLimit(handler, { max: 10, windowMs: 60 * 1000 });
