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

async function resetPassword() {
    const email = 'abhinav.bck318@gmail.com';
    const newPassword = 'Admin@123';

    console.log(`Resetting password for: ${email}...`);

    // 1. Find user in Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.find(u => u.email === email);
    if (!user) {
        console.error(`User ${email} not found in Auth!`);
        return;
    }

    // 2. Update Password
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: newPassword,
        email_confirm: true
    });

    if (updateError) {
        console.error('Error resetting password:', updateError.message);
        return;
    }

    console.log(`✅ Successfully reset password for ${email} to: ${newPassword}`);
}

resetPassword().catch(console.error);
