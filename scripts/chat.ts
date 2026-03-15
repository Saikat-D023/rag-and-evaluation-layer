import { generateAnswer } from '../packages/rag-core';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function ask() {
    rl.question('\nAsk your document a question (or type "exit"): ', async (query) => {
        if (query.toLowerCase() === 'exit') return rl.close();

        console.log("Thinking...");
        const answer = await generateAnswer(query);
        console.log(`\nAnswer: ${answer}`);

        ask(); // Loop for the next question
    });
}

console.log("--- Production RAG Terminal Chat ---");
ask();