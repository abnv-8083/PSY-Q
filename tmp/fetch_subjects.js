
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'frontend/.env' });

async function getSubjects() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase.from('subjects').select('name');
  if (error) {
    console.error('Error fetching subjects:', error);
    return;
  }
  console.log('Subjects:', data.map(s => s.name));
}

getSubjects();
