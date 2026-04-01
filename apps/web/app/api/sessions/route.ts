import { NextResponse } from 'next/server';
import { db } from '@/db';
import { chatSessions } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const sessions = await db
      .select({
        id: chatSessions.id,
        title: chatSessions.title,
        updatedAt: chatSessions.updatedAt,
      })
      .from(chatSessions)
      .orderBy(desc(chatSessions.updatedAt));
    
    return NextResponse.json(sessions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title } = await req.json();
    const [newSession] = await db
      .insert(chatSessions)
      .values({ title: title || 'New Chat' })
      .returning();
      
    return NextResponse.json(newSession);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
