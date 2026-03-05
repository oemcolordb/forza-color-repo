import { createClient } from '@libsql/client';
import { NextResponse } from 'next/server';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!
});

export const POST = async () => {
  try {
    const result = await client.execute("CREATE TABLE IF NOT EXISTS todos (description TEXT);");
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
};
