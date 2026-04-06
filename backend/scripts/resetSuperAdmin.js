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

async function resetSuperAdmin() {
    const email = 'admin@psyq.com';
    const newPassword = 'Admin@123';

    console.log(`Resetting password & role for: ${email}...`);

    // 1. Find user in Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.find(u => u.email === email);
    if (!user) {
        console.error(`User ${email} not found in Auth!`);
        return;
    }

    // 2. Update Auth (Password + Sync Metadata)
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: newPassword,
        email_confirm: true,
        user_metadata: { ...user.user_metadata, role: 'super_admin' },
        app_metadata: { role: 'super_admin' }
    });

    if (authUpdateError) {
        console.error('Error updating auth:', authUpdateError.message);
        return;
    }

    // 3. Update Profiles Table
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            email: email,
            role: 'super_admin'
        });

    if (profileError) {
        console.error('Error updating profile:', profileError.message);
    }

    console.log(`✅ Successfully reset password for ${email} to: ${newPassword}`);
    console.log(`✅ Confirmed role is set to: super_admin`);
}

resetSuperAdmin().catch(console.error);
