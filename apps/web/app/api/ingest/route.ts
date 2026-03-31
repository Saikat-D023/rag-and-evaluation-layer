import { processTextIntoChunks, syncChunksWithEmbeddings } from "@repo/rag-core";
import { NextResponse } from "next/server";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

const require = createRequire(import.meta.url);
const pdfWorkerPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
PDFParse.setWorker(pathToFileURL(pdfWorkerPath).href);

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = "";
        const fileName = file.name;

        if (fileName.toLowerCase().endsWith(".pdf")) {
            const parser = new PDFParse({ data: buffer });
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

        // Step 2: Embedding & Sync (Uses OpenAI SDK inside rag-core)
        await syncChunksWithEmbeddings(chunks);

        return NextResponse.json({
            success: true,
            message: `Successfully indexed ${chunks.length} chunks.`
        });

    } catch (error) {
        console.error("[Ingest Error]:", error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        }
        return NextResponse.json({ error: String(error), details: error }, { status: 500 });
    }
}
