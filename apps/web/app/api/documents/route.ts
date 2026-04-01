import { NextResponse } from 'next/server';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Group by source (from metadata->>'source') and count chunks
    const result = await db
      .select({
        source: sql<string>`${documents.metadata}->>'source'`,
        chunkCount: sql<number>`count(*)::int`,
      })
      .from(documents)
      .groupBy(sql`${documents.metadata}->>'source'`)
      .orderBy(sql`${documents.metadata}->>'source'`);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
