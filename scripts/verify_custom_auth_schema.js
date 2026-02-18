import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function verifySchema() {
    console.log('Verifying custom auth tables...');

    // Check students table
    const { data: students, error: studentError } = await supabase
        .from('students')
        .select('*')
        .limit(1);

    if (studentError) {
        console.error('❌ Students table check failed:', studentError.message);
    } else {
        console.log('✅ Students table exists.');
    }

    // Check admins table
    const { data: admins, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .limit(1);

    if (adminError) {
        console.error('❌ Admins table check failed:', adminError.message);
    } else {
        console.log('✅ Admins table exists.');
    }

    // Check for full_name in admins
    if (!adminError) {
        const { data: columns, error: colError } = await supabase.rpc('get_table_columns_names', { table_name: 'admins' });
        // Since I don't have this RPC, I'll just try to select full_name specifically
        const { error: nameError } = await supabase
            .from('admins')
            .select('full_name')
            .limit(1);

        if (nameError) {
            console.error('❌ full_name column missing in admins table:', nameError.message);
        } else {
            console.log('✅ full_name column exists in admins table.');
        }
    }
}

verifySchema().catch(console.error);
