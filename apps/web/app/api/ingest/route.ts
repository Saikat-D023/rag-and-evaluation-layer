import { processTextIntoChunks, syncChunksWithEmbeddings } from "@repo/rag-core";
import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        const profileRecord = await db.query.profiles.findFirst({
            where: eq(profiles.id, user.id)
        });
        const apiKey = profileRecord?.openaiApiKey || null;

        if (!apiKey && !process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "OpenAI API key is required. Please set it in the Settings." }, { status: 400 });
        }

        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = "";
        const fileName = file.name;

        if (fileName.toLowerCase().endsWith(".pdf")) {
            const parser = new PDFParse({ data: new Uint8Array(buffer) });
            try {
                const data = await parser.getText();
                text = data.text;
            } finally {
                await parser.destroy();
            }
        } else if (fileName.toLowerCase().endsWith(".docx") || fileName.toLowerCase().endsWith(".doc")) {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else {
            text = await file.text();
        }

        if (!text.trim()) return NextResponse.json({ error: "Could not extract text from file" }, { status: 400 });

        // Step 1: Chunking
        const chunks = processTextIntoChunks(text, fileName);

        await syncChunksWithEmbeddings(chunks, user.id, apiKey || undefined);

        return NextResponse.json({
            success: true,
            message: `Successfully indexed ${chunks.length} chunks.`
        });

    } catch (error: any) {
        console.error("[Ingest Error]:", error);
        require('fs').writeFileSync('pdf-error.log', String(error?.stack || error));
        const errMessage = error?.message || String(error);
        return NextResponse.json({ error: errMessage, details: error }, { status: 500 });
    }
}
