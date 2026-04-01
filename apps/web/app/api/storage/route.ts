import { NextResponse } from 'next/server';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db
      .select({
        totalChunks: sql<number>`count(*)::int`,
      })
      .from(documents);
      
    const totalChunks = result[0]?.totalChunks || 0;
    const MAX_CHUNKS = 10000; 
    const percentage = Math.min(Math.round((totalChunks / MAX_CHUNKS) * 100), 100);

    return NextResponse.json({
      totalChunks,
      maxChunks: MAX_CHUNKS,
      percentage,
      estimatedSizeMB: (totalChunks * 1.5) / 1024, // Assuming ~1.5KB per chunk on avg
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
