import { OpenAI } from "openai";
import { retrieveHybrid } from "@repo/rag-core";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    /*
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }
    */

    try {
        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1].content;

        // 1. Get the facts using your Hybrid logic
        const contextResults = await retrieveHybrid(lastMessage, 3);

        // 2. Format context and extract citation metadata
        const contextText = contextResults
            .map((c: any) => `[ID: ${c.id}] Content: ${c.content}`)
            .join("\n\n");

        const citations = contextResults.map((c: any) => ({
            id: c.id,
            source: c.metadata?.source || "Unknown",
            chunkIndex: c.metadata?.chunkIndex
        }));

        // 3. Create a Stream
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

        // 4. Return as a ReadableStream (This is what the frontend expects)
        const encoder = new TextEncoder();
        const customStream = new ReadableStream({
            async start(controller) {
                // Send citations first so the UI knows the sources immediately
                controller.enqueue(encoder.encode(`metadata:${JSON.stringify(citations)}\n\n`));

                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    controller.enqueue(encoder.encode(content));
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