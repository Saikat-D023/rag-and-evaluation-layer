import { retrieveRelevantChunks } from '../packages/rag-core';

async function testRetrieval() {
    const query = "What is Retrieval-augmented generation?"; // Or any question based on your sample.txt

    console.log(`Searching for: "${query}"`);

    try {
        const results = await retrieveRelevantChunks(query, 2);

        console.log("\n--- Top Results ---");
        results?.forEach((res: any, i: number) => {
            console.log(`\n[Result ${i + 1}] (Similarity: ${(res.similarity * 100).toFixed(2)}%)`);
            console.log(`Content: ${res.content}`);
        });
    } catch (err) {
        console.error("Search failed:", err);
    }
}

testRetrieval();