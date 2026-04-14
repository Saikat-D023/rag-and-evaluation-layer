import { NextResponse } from 'next/server';
import { db } from '@/db';
import { chatMessages, chatSessions } from '@/db/schema';
import { eq, asc, and } from 'drizzle-orm';
import { createClient } from "@/utils/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: sessionId } = await params;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Verify session ownership
    const session = await db.query.chatSessions.findFirst({
        where: (sessions, { eq, and }) => and(eq(sessions.id, sessionId), eq(sessions.userId, user.id))
    });

    if (!session) {
        return NextResponse.json({ error: "Session not found or unauthorized" }, { status: 404 });
    }

    const messages = await db
      .select({
        id: chatMessages.id,
        role: chatMessages.role,
        content: chatMessages.content,
        metadata: chatMessages.metadata,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt));
      
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
