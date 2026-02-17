import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixStudent() {
    const email = 'primeheaven.org@gmail.com';
    console.log(`Fixing student account: ${email}...`);

    // 1. Find user in Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.find(u => u.email === email);
    if (!user) {
        console.error(`User ${email} not found in Auth!`);
        return;
    }

    console.log(`Found user ${email} with ID: ${user.id}`);

    // 2. Update Auth metadata
    console.log('Updating Auth metadata to role: student...');
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, role: 'student' },
        app_metadata: { role: 'student' }
    });
    if (authUpdateError) console.error('Auth update error:', authUpdateError);

    // 3. Ensure profile exists and has student role
    console.log('Upserting to profiles table...');
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            email: email,
            role: 'student',
            full_name: user.user_metadata?.full_name || 'Student User'
        });

    if (profileError) throw profileError;

    console.log('✅ Successfully fixed student account!');
}

fixStudent().catch(console.error);
