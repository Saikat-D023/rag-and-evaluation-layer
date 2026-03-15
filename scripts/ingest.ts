import fs from 'fs';
import path from 'path';
import { processTextIntoChunks, insertChunks } from '../packages/rag-core';

async function runIngestion() {
    const filePath = path.join(__dirname, '../data/raw/sample1.txt');

    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');

        // 1. Process into structured chunks
        const chunks = processTextIntoChunks(content, "sample1-doc");

        // 2. Push to Supabase
        try {
            await insertChunks(chunks);
        } catch (err) {
            console.error("Failed to ingest:", err);
        }
    }
}

runIngestion();