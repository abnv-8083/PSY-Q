import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBundles() {
    const { data, error } = await supabase
        .from('bundles')
        .select('id, name, bundle_type, regular_price, offer_price');

    if (error) {
        console.error('Error fetching bundles:', error);
        return;
    }

    console.log('--- Bundles Data JSON START ---');
    console.log(JSON.stringify(data, null, 2));
    console.log('--- Bundles Data JSON END ---');
}

checkBundles();
