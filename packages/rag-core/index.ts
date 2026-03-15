import { ProjectStatus } from "@repo/shared-types";
import { Chunk } from "@repo/shared-types";
import * as dotenv from "dotenv";
import * as path from "path";
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export function getRAGStatus(): ProjectStatus {
    return {
        message: "RAG core is initialized and communicating!",
        isReady: true
    };
}

export const chunkText = (text: string, size: number = 500): string[] => {
    const chunks: string[] = [];
    let index = 0;

    while (index < text.length) {
        chunks.push(text.slice(index, index + size));
        index += size;
    }

    return chunks;
};

export const processTextIntoChunks = (text: string, sourceName: string): Chunk[] => {
    const rawStrings = chunkText(text, 500);

    return rawStrings.map((str, i) => ({
        id: `${sourceName}-${i}`,
        text: str,
        metadata: {
            source: sourceName,
            chunkIndex: i
        }
    }));
};

export const insertChunks = async (chunks: Chunk[]) => {
    console.log(`Upserting ${chunks.length} chunks to Supabase...`);

    const { data, error } = await supabase
        .from('documents')
        .upsert(
            chunks.map((c) => ({
                id: c.id,
                content: c.text,
                metadata: c.metadata,
                // Embedding is null for now, we'll add OpenAI in the next phase
            }))
        );

    if (error) {
        console.error("Supabase Error:", error.message);
        throw error;
    }

    console.log("Successfully stored chunks in the cloud.");
    return data;
};