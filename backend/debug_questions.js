import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function debugQuestions() {
    console.log("🔍 Debugging Questions Table in Supabase...");
    
    // 1. Check count again
    const { count, error: countErr } = await supabase.from('questions').select('*', { count: 'exact', head: true });
    console.log(`Count result: ${count}, Error: ${countErr?.message || 'none'}`);

    // 2. Try to fetch just one record
    const { data, error: dataErr } = await supabase.from('questions').select('*').limit(1);
    console.log(`Fetch result: ${data?.length || 0} records, Error: ${dataErr?.message || 'none'}`);
    
    if (data && data.length > 0) {
        console.log("Sample Data found!");
    } else {
        console.log("❌ No data returned. This is likely an RLS issue on the 'questions' table.");
    }
}
debugQuestions();
