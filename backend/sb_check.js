import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const collections = [
        'subjects', 'tests', 'questions', 'students', 'admins', 
        'bookings', 'purchase_requests', 'payments', 'bundles', 'attempts'
    ];
    
    console.log("Supabase Counts:");
    for (const name of collections) {
        const { count, error } = await supabase.from(name).select('*', { count: 'exact', head: true });
        if (error) console.log(`${name}: Error ${error.message}`);
        else console.log(`${name}: ${count}`);
    }
}
check();
