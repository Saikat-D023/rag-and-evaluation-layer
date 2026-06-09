import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

const envLocalPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envLocalPath });

const dbUrl = process.env.DATABASE_URL;

async function checkDb() {
  if (!dbUrl) {
    console.error("No DATABASE_URL found!");
    return;
  }
  const sql = postgres(dbUrl, { ssl: 'require' });
  
  const docs = await sql`SELECT id, user_id, content FROM documents`;
  console.log(`Found ${docs.length} documents.`);
  if (docs.length > 0) {
    console.log("Sample doc:", docs[0].id, docs[0].user_id, docs[0].content.substring(0, 50));
  }

  const profiles = await sql`SELECT id, email FROM profiles`;
  console.log(`Found ${profiles.length} profiles.`);
  if (profiles.length > 0) {
    console.log("Sample profile:", profiles[0]);
  }

  process.exit(0);
}

checkDb().catch(console.error);
