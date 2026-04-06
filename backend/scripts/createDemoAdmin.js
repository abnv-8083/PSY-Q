import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function createDemoAdmin() {
    try {
        const name = 'Demo Admin';
        const email = 'demo@admin.com';
        const password = 'Password123!';
        const phone = '+910000000000';

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email, password, email_confirm: true,
            user_metadata: { full_name: name, phone }
        });

        if (authError && !authError.message.includes('already registered')) throw authError;

        let userId = authData?.user?.id;
        
        if (!userId) {
            // If already registered, find the user ID or just ignore 
            console.log('User already registered. Using existing auth user.');
            return;
        }

        const { error: adminError } = await supabase.from('admins').insert({
            id: userId, full_name: name, email, phone, role: 'super_admin', is_super_admin: true,
            permissions: { manageUsers: true, manageContent: true, manageSubAdmins: true, viewAnalytics: true, manageSettings: true, manageBundles: true, manageTests: true, manageQuestions: true },
            created_at: new Date().toISOString()
        });

        await supabase.from('profiles').insert({
            id: userId, full_name: name, email, phone, role: 'admin', created_at: new Date().toISOString()
        });

        console.log('✅ Demo Admin created! Email: demo@admin.com | Password: Password123!');
    } catch (e) {
        console.error(e);
    }
}
createDemoAdmin();
