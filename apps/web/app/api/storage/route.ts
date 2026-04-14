import { NextResponse } from 'next/server';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await db
      .select({
        totalChunks: sql<number>`count(*)::int`,
      })
      .from(documents)
      .where(eq(documents.userId, user.id));

    const totalChunks = result[0]?.totalChunks || 0;
...
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
