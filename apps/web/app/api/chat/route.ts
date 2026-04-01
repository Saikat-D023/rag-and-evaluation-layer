import { OpenAI } from "openai";
import { retrieveHybrid } from "@repo/rag-core";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { chatSessions, chatMessages } from "@/db/schema";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    try {
        const { messages, sessionId: providedSessionId } = await req.json();
        const lastMessage = messages[messages.length - 1].content;
        
        // 1. Handle Session
        let sessionId = providedSessionId;
        if (!sessionId) {
             const [newSession] = await db
                .insert(chatSessions)
                .values({ 
                    title: lastMessage.slice(0, 50) + (lastMessage.length > 50 ? "..." : "") || 'New Chat' 
                })
                .returning();
             if (!newSession) throw new Error("Failed to create chat session");
             sessionId = newSession.id;
        }

        // 2. Save User Message
        await db.insert(chatMessages).values({
            sessionId,
            role: "user",
            content: lastMessage,
        });

        // 3. Get the facts using your Hybrid logic
        const contextResults = await retrieveHybrid(lastMessage, 3);

        // 4. Format context and extract citation metadata
        const contextText = contextResults
            .map((c: any) => `[ID: ${c.id}] Content: ${c.content}`)
            .join("\n\n");

        const citations = contextResults.map((c: any) => ({
            id: c.id,
            source: c.metadata?.source || "Unknown",
            chunkIndex: c.metadata?.chunkIndex
        }));

        // 5. Create a Stream
        const stream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful and intelligent AI assistant. 
          Respond to the user naturally and directly. If context from documents is provided, use it to inform your answers and provide specific citations.
          But if the context is empty or irrelevant to the user's question, freely answer the question using your own general knowledge.
          
          CONTEXT:
          ${contextText}`
                },
                ...messages
            ],
            stream: true,
        });

        // 6. Return as a ReadableStream and save Assistant message when done
        const encoder = new TextEncoder();
        const customStream = new ReadableStream({
            async start(controller) {
                // Send citations and sessionId first so the UI knows
                const metadataStr = JSON.stringify({ citations, sessionId });
                controller.enqueue(encoder.encode(`metadata:${metadataStr}\n\n`));

                let fullAssistantMessage = "";

                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    fullAssistantMessage += content;
                    controller.enqueue(encoder.encode(content));
                }

                // Save Assistant Message
                try {
                    await db.insert(chatMessages).values({
                        sessionId,
                        role: "assistant",
                        content: fullAssistantMessage,
                        metadata: { citations },
                    });
                } catch(e) {
                    console.error("Failed to save assistant message", e);
                }

                controller.close();
            },
        });

        return new Response(customStream);

    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    }
}