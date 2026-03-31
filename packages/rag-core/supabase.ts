import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

function loadEnv() {
    let currentDir = process.cwd();
    const candidateNames = ['.env.local', '.env'];
    // Walk upward to find either a local app env file or the repo root env file.
    for (let i = 0; i < 5; i++) {
        for (const candidateName of candidateNames) {
            const envPath = path.join(currentDir, candidateName);
            if (fs.existsSync(envPath)) {
                dotenv.config({ path: envPath });
                return;
            }
        }
        currentDir = path.join(currentDir, '..');
    }
}

loadEnv();

const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("DEBUG: Current Environment Variables:", {
        URL: !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
        KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        CWD: process.cwd()
    });
    throw new Error(
        "Missing Supabase environment variables. Expected SUPABASE_SERVICE_ROLE_KEY and either SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL."
    );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
