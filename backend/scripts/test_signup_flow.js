import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

// Use Anon key to simulate frontend behavior
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Use Service key to check backend state
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testSignup() {
    const testEmail = `test.student.${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    const testName = 'Test Student';
    const testPhone = '1234567890';

    console.log(`Attempting to signup user: ${testEmail}`);

    // 1. Attempt Signup
    const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
            data: {
                full_name: testName,
                phone: testPhone,
                role: 'student'
            }
        }
    });

    if (error) {
        console.error('❌ Signup failed:', error.message);
        return;
    }

    if (!data.user) {
        console.error('❌ No user returned from signup (check if email confirmation is enabled and causing issues).');
        return;
    }

    console.log(`✅ Signup successful. User ID: ${data.user.id}`);

    // 2. Verification: Check if profile was created via trigger
    console.log('Verifying profile creation...');

    // Wait a brief moment for trigger to fire
    await new Promise(r => setTimeout(r, 2000));

    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (profileError) {
        console.error('❌ Profile check failed:', profileError.message);
        console.error('Possible causes: Trigger failed, table missing columns, or RLS blocked insert (though trigger is SECURITY DEFINER).');
    } else {
        console.log('✅ Profile found:', profile);
        if (profile.role === 'student' && profile.phone === testPhone) {
            console.log('✅ Role and Phone synced correctly!');
        } else {
            console.error('⚠️ Data mismatch in profile:', profile);
        }
    }
}

testSignup().catch(console.error);
