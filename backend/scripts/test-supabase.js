import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function testSupabase() {
    console.log("Testing Supabase connectivity...");
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.from('subjects').select('count', { count: 'exact' });
    if (error) console.error("❌ Supabase failed:", error.message);
    else console.log("✅ Supabase success! Found subjects:", data);
}
testSupabase();
