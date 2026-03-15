import { ProjectStatus } from "@repo/shared-types";
import { Chunk } from "@repo/shared-types";
import * as dotenv from "dotenv";
import * as path from "path";
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from "openai";

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

export const generateEmbeddings = async (text: string) => {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
    });

    return response.data[0].embedding;
};

export const syncChunksWithEmbeddings = async (chunks: Chunk[]) => {
    console.log(`Generating embeddings for ${chunks.length} chunks...`);

    const enrichedChunks = await Promise.all(
        chunks.map(async (chunk) => {
            const embedding = await generateEmbeddings(chunk.text);
            return {
                id: chunk.id,
                content: chunk.text,
                metadata: chunk.metadata,
                embedding: embedding,
            };
        })
    );

    const { error } = await supabase
        .from('documents')
        .upsert(enrichedChunks, { onConflict: 'id' });

    if (error) throw error;
    console.log("Cloud database fully synced with vectors!");
};

export const retrieveRelevantChunks = async (query: string, limit = 3) => {
    // 1. Turn the user's question into a vector
    const queryEmbedding = await generateEmbeddings(query);

    // 2. Search Supabase using the RPC we just created
    const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.3, // Only return relevant stuff
        match_count: limit,
    });

    if (error) throw error;
    return data;
};

export const generateAnswer = async (query: string) => {
    // 1. Get the facts from your database
    const contextChunks = await retrieveRelevantChunks(query, 2);

    if (!contextChunks || contextChunks.length === 0) {
        return "I'm sorry, I couldn't find any relevant information in the database.";
    }

    // 2. Combine the chunks into one string
    const contextText = contextChunks.map(c => c.content).join("\n\n");

    // 3. Ask the LLM to answer based ONLY on that context
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are a helpful assistant. Use the provided context to answer the user's question. 
                If the user asks for a specific tone (like "like I'm five"), use the facts from the context but adapt the language accordingly.
                
                Context:
                ${contextText}`
            },
            { role: "user", content: query },
        ],
    });

    return response.choices[0].message.content;
};