import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

function loadEnv() {
    let currentDir = __dirname;
    // Go up up to 5 levels to find the .env file
    for (let i = 0; i < 5; i++) {
        const envPath = path.join(currentDir, '.env');
        if (fs.existsSync(envPath)) {
            dotenv.config({ path: envPath });
            return;
        }
        currentDir = path.join(currentDir, '..');
    }
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("DEBUG: Current Environment Variables:", {
        URL: !!process.env.SUPABASE_URL,
        KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        CWD: process.cwd()
    });
    throw new Error("Missing Supabase Environment Variables in .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);