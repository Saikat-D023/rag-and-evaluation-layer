import fs from 'fs';
import path from 'path';
import { chunkText } from '@repo/rag-core';

async function runIngestion() {
    console.log("Starting Ingestion...");

    const filePath = path.join(__dirname, '../data/raw/sample1.txt');

    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');

        console.log("Chunking data...");
        const chunks = chunkText(content, 100);
        console.log(`Found ${chunks.length} chunks.`);
        console.log("First chunk:", chunks[0]);
        console.log("Last chunk:", chunks[chunks.length - 1]);
    } else {
        console.error("Could not find data/raw/sample.txt");
    }
}

runIngestion();
