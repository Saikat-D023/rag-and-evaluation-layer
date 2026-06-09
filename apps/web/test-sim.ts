import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import { OpenAI } from 'openai';

const envLocalPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envLocalPath });

const dbUrl = process.env.DATABASE_URL;

async function testQuery() {
  if (!dbUrl) {
    console.error("No DATABASE_URL found!");
    return;
  }
  const sql = postgres(dbUrl, { ssl: 'require' });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const query = "yes write this as per the resume pdf above , use it for context";
  
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  
  const queryEmbedding = response.data[0]?.embedding;
  
  const docs = await sql`
    SELECT
      id,
      content,
      1 - (embedding <=> ${JSON.stringify(queryEmbedding)}) AS similarity
    FROM documents
    WHERE user_id = '24b903d5-41ee-4e44-9e0d-254d8caf4582'
    ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}
  `;
  
  console.log(`Found ${docs.length} total documents for user.`);
  docs.forEach(d => {
    console.log(`ID: ${d.id}, Similarity: ${d.similarity}`);
  });

  process.exit(0);
}

testQuery().catch(console.error);
