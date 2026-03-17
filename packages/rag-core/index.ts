import { ProjectStatus, Chunk } from "@repo/shared-types";
import * as dotenv from "dotenv";
import * as path from "path";
import { OpenAI } from "openai";
import bm25 from 'wink-bm25-text-search';

// 1. Import the shared client
import { supabase } from './supabase';

// 2. Re-export everything from supabase so it's accessible externally
export * from './supabase';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// --- Logic remains the same, but uses the imported 'supabase' ---

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
            }))
        );
    if (error) throw error;
    return data;
};

export const generateEmbeddings = async (text: string) => {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
    });
    return response.data[0]?.embedding;
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
};

export const retrieveRelevantChunks = async (query: string, limit = 3) => {
    const queryEmbedding = await generateEmbeddings(query);
    const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: limit,
    });
    if (error) throw error;
    return data;
};

export const generateAnswer = async (query: string) => {
    const contextChunks = await retrieveRelevantChunks(query, 2);
    if (!contextChunks || contextChunks.length === 0) {
        return "I'm sorry, I couldn't find any relevant information in the database.";
    }
    const contextText = contextChunks.map((c: any) => c.content).join("\n\n");
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are a helpful assistant. Use the provided context to answer the user's question. 
                Context:\n${contextText}`
            },
            { role: "user", content: query },
        ],
    });
    return response.choices[0]?.message?.content;
};

export const retrieveHybrid = async (query: string, limit = 3) => {
    // 1. Get Semantic results (Dense Retrieval)
    const vectorResults = await retrieveRelevantChunks(query, 10);

    // FIX: If we have very few results, BM25 consolidation will fail.
    // Just return what we have.
    if (vectorResults.length < 3) {
        return vectorResults.slice(0, limit);
    }

    // 2. Initialize Wink BM25
    const engine = bm25();
    engine.defineConfig({ fldWeights: { content: 1 } });

    const docs = vectorResults.map((res: any, i: number) => ({
        id: i,
        content: res.content
    }));

    docs.forEach((doc: any) => engine.addDoc(doc));

    try {
        engine.consolidate();
        const results = engine.search(query);

        return results
            .map((item: any) => {
                const originalDoc = vectorResults[item[0] as number];
                return { ...originalDoc, bm25Score: item[1] };
            })
            .slice(0, limit);
    } catch (e) {
        // Fallback to vector results if BM25 still complains
        console.warn("BM25 consolidation skipped:", e.message);
        return vectorResults.slice(0, limit);
    }
};