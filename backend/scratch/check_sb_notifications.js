import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseNotifications() {
  const { data, error } = await supabase.from('notifications').select('*');
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log(`Total notifications in Supabase: ${data.length}`);
  data.forEach(n => console.log(`Header: ${n.header}`));
  process.exit(0);
}
checkSupabaseNotifications();
