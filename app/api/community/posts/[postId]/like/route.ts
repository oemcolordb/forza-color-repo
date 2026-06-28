import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/lib/db/db';
import { withRateLimit } from '@/lib/utils/rateLimit';

async function handler(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    await ensureTables();
    const db = getDb();
    const { postId } = params;

    // Get a guest session ID for likes (since users might not be logged in)
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    // Use user-agent and IP to create a pseudo-session for liking if no actual session exists
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const userId = Buffer.from(`${ip}-${userAgent}`).toString('base64').substring(0, 32);

    // Check if like exists
    const existing = await db.execute({
      sql: 'SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?',
      args: [postId, userId],
    });

    if (existing.rows.length > 0) {
      // Unlike
      await db.execute({
        sql: 'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
        args: [postId, userId],
      });
      await db.execute({
        sql: 'UPDATE community_posts SET likes = max(0, likes - 1) WHERE id = ?',
        args: [postId],
      });
      return NextResponse.json({ success: true, action: 'unliked' });
    } else {
      // Like
      await db.execute({
        sql: 'INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)',
        args: [postId, userId],
      });
      await db.execute({
        sql: 'UPDATE community_posts SET likes = likes + 1 WHERE id = ?',
        args: [postId],
      });
      return NextResponse.json({ success: true, action: 'liked' });
    }
  } catch (error) {
    console.error('Like toggle failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withRateLimit(handler, { max: 30, windowMs: 60 * 1000 });
