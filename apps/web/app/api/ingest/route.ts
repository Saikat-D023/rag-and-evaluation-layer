import { processTextIntoChunks, syncChunksWithEmbeddings } from "@repo/rag-core";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { text, fileName } = await req.json();

        if (!text) return NextResponse.json({ error: "No text provided" }, { status: 400 });

        // Step 1: Chunking 
        const chunks = processTextIntoChunks(text, fileName || "upload");

        // Step 2: Embedding & Sync (Uses OpenAI SDK inside rag-core)
        await syncChunksWithEmbeddings(chunks);

        return NextResponse.json({
            success: true,
            message: `Successfully indexed ${chunks.length} chunks.`
        });

    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    }
}