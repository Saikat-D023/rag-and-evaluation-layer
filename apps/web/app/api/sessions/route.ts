import { NextResponse } from 'next/server';
import { db } from '@/db';
import { chatSessions } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessions = await db
      .select({
        id: chatSessions.id,
        title: chatSessions.title,
        updatedAt: chatSessions.updatedAt,
      })
      .from(chatSessions)
      .where(eq(chatSessions.userId, user.id))
      .orderBy(desc(chatSessions.updatedAt));
    
    return NextResponse.json(sessions);
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title } = await req.json();
    const [newSession] = await db
      .insert(chatSessions)
      .values({ 
        userId: user.id,
        title: title || 'New Chat' 
      })
      .returning();
      
    return NextResponse.json(newSession);
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
