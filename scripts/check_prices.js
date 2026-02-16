import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPrices() {
    const { data, error } = await supabase
        .from('bundles')
        .select('name, regular_price, offer_price');

    if (error) {
        console.error(error);
        return;
    }

    data.forEach(b => {
        console.log(`BUNDLE: ${b.name} | REG: ${b.regular_price} | OFFER: ${b.offer_price} | TYPE OF OFFER: ${typeof b.offer_price}`);
    });
}

checkPrices();
