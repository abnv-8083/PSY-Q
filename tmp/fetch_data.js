
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'frontend/.env' });

async function getData() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: subjects, error: subError } = await supabase.from('subjects').select('name');
  if (subError) console.error('Error fetching subjects:', subError);
  else console.log('Subjects:', subjects.map(s => s.name));

  const { data: bundles, error: bunError } = await supabase.from('bundles').select('name');
  if (bunError) console.error('Error fetching bundles:', bunError);
  else console.log('Bundles:', bundles.map(b => b.name));
}

getData();
