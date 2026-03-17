import fs from 'fs';
import * as path from "path";
import { OpenAI } from "openai";
import { supabase, generateAnswer, retrieveHybrid } from '../packages/rag-core';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function runEvaluation() {
    const datasetPath = path.join(__dirname, '../data/golden-dataset/qa-pairs.json');
    const qaPairs = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

    console.log(`🧪 Starting evaluation on ${qaPairs.length} questions...`);

    const results = [];
    let totalFaithfulness = 0;

    for (const qa of qaPairs) {
        console.log(`\nQuestion: ${qa.question}`);

        // 1. Run the RAG Pipeline
        const startTime = Date.now();
        const context = await retrieveHybrid(qa.question, 2);
        const answer = await generateAnswer(qa.question);
        const latency = Date.now() - startTime;

        // 2. LLM-as-a-Judge: Score Faithfulness
        // We ask a separate LLM call to verify if the answer is supported by the context
        const judgeResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a strict grader. Rate the FAITHFULNESS of the answer based ONLY on the provided context. Score 1 if perfectly supported, 0 if it contains outside info or hallucinations. Return ONLY the number." },
                { role: "user", content: `Context: ${context.map(c => c.content).join('\n')}\n\nAnswer: ${answer}` }
            ]
        });

        const score = parseFloat(judgeResponse.choices[0].message.content || "0");
        totalFaithfulness += score;

        results.push({
            question: qa.question,
            answer,
            context: context.map(c => c.content),
            score,
            latency
        });
    }

    // 3. Save the Run to Supabase
    const avgFaithfulness = totalFaithfulness / qaPairs.length;

    const { error } = await supabase.from('evaluation_runs').insert({
        pipeline_config: { retriever: "hybrid-wink", model: "gpt-4o-mini" },
        metrics: { avg_faithfulness: avgFaithfulness },
        per_question: results
    });

    if (error) console.error("Error saving to Supabase:", error);
    else console.log(`\n✅ Eval Complete! Average Faithfulness: ${avgFaithfulness * 100}%`);
}

runEvaluation();