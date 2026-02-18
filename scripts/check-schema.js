import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndUpdateSchema() {
    console.log('Checking admins table schema...');

    // Try to select one row to see which columns exist
    const { data, error } = await supabase.from('admins').select('*').limit(1);

    if (error) {
        console.error('Error selecting from admins:', error);
        process.exit(1);
    }

    const row = data[0] || {};
    console.log('Current row structure:', Object.keys(row));

    const missingColumns = [];
    if (!('is_blocked' in row)) missingColumns.push('is_blocked');
    if (!('permissions' in row)) missingColumns.push('permissions');

    if (missingColumns.length === 0) {
        console.log('All required columns exist.');
    } else {
        console.log('Missing columns found:', missingColumns);
        console.log('--- PLEASE MANUALLY RUN THE FOLLOWING SQL IN SUPABASE ---');
        if (missingColumns.includes('is_blocked')) {
            console.log('ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;');
        }
        if (missingColumns.includes('permissions')) {
            console.log("ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{\"manageUsers\": false, \"manageContent\": true, \"manageBundles\": false, \"manageTests\": true, \"manageQuestions\": true, \"viewAnalytics\": true, \"manageSettings\": false}';");
        }
        console.log('---------------------------------------------------------');

        // Note: I can't run ALTER TABLE via supabase-js without a custom function or RPC.
        // I will assume for now I should just proceed if the user says they exist, or I can try to use them.
    }
}

checkAndUpdateSchema();
