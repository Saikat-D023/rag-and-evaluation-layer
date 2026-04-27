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
    // Group by source (from metadata->>'source') and count chunks for current user
    const result = await db
      .select({
        source: sql<string>`${documents.metadata}->>'source'`,
        chunkCount: sql<number>`count(*)::int`,
      })
      .from(documents)
      .where(eq(documents.userId, user.id))
      .groupBy(sql`${documents.metadata}->>'source'`)
      .orderBy(sql`${documents.metadata}->>'source'`);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
