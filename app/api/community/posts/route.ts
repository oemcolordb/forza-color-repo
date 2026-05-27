import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/app/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    await ensureTables();
    const db = getDb();

    const result = await db.execute(`
      SELECT * FROM community_posts
      ORDER BY created_at DESC
      LIMIT 50
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Community posts fetch failed:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureTables();
    const db = getDb();
    const { user_id, username, image_url, caption, car_name, tune_code } = await req.json();

    if (!user_id || !username || !image_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = uuidv4();
    await db.execute({
      sql: `INSERT INTO community_posts (id, user_id, username, image_url, caption, car_name, tune_code)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, user_id, username, image_url, caption || null, car_name || null, tune_code || null]
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Post creation failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
