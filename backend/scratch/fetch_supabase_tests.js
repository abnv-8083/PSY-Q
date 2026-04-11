import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchSupabaseTests() {
  try {
    const { data, error } = await supabase.from('tests').select('id, name');
    if (error) throw error;
    
    console.log(`Fetched ${data.length} tests from Supabase.`);
    data.slice(0, 10).forEach(t => {
      console.log(`[${t.id}] ${t.name}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fetchSupabaseTests();
