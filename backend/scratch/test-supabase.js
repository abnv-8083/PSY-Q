import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase configuration");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSupabase() {
    console.log("Testing Supabase connectivity to:", supabaseUrl);
    try {
        // Try to fetch something simple, like the count of users from auth or bundles table
        const { data, error } = await supabase.from('bundles').select('id').limit(1);
        if (error) {
            console.error("❌ Supabase query failed:", error.message);
        } else {
            console.log("✅ Supabase success! Found data:", data);
        }
    } catch (e) {
        console.error("❌ Exception during Supabase test:", e);
    }
}

testSupabase();
