import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
async function getStructure() {
    const { data } = await supabase.from('questions').select('*').limit(1);
    fs.writeFileSync('q_structure.json', JSON.stringify(data[0], null, 2), 'utf8');
    process.exit();
}
getStructure();
