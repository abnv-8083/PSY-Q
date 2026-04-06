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

async function fixAdmin() {
    const email = 'admin@psyq.com';
    console.log(`Checking user: ${email}...`);

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
    console.log('Updating Auth metadata...');
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, role: 'super_admin' }
    });
    if (authUpdateError) console.error('Auth update error:', authUpdateError);

    // 3. Update Profiles table
    console.log('Updating profiles table...');
    const { error: profileUpdateError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            email: email,
            role: 'super_admin',
            updated_at: new Date().toISOString()
        });

    if (profileUpdateError) {
        console.log('Retrying without updated_at...');
        const { error: retryError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: email,
                role: 'super_admin'
            });
        if (retryError) throw retryError;
    }

    console.log('✅ Successfully updated user to super_admin in both Auth and Profiles!');
}

fixAdmin().catch(console.error);
