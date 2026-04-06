/**
 * Development Script: Create Super Admin User
 * 
 * This script creates a super admin account for development purposes using Supabase.
 * Run this once to set up your admin access.
 * 
 * Usage: node scripts/createSuperAdmin.js
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

// Load environment variables
dotenv.config();

// Supabase configuration from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing Supabase credentials in .env file');
    console.log('Required variables: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)');
    process.exit(1);
}

// Initialize Supabase with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createSuperAdmin() {
    try {
        console.log('\n🔐 Super Admin Account Creation\n');
        console.log('This will create a development super admin account.\n');

        // Get admin details
        const name = await question('Enter admin name (default: Super Admin): ') || 'Super Admin';
        const email = await question('Enter admin email (default: admin@psyq.com): ') || 'admin@psyq.com';
        const password = await question('Enter admin password (default: Admin@123): ') || 'Admin@123';
        const phone = await question('Enter admin phone (default: +1234567890): ') || '+1234567890';

        console.log('\n⏳ Creating super admin account...\n');

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Auto-confirm email for dev
            user_metadata: {
                full_name: name,
                phone: phone
            }
        });

        if (authError) throw authError;

        const userId = authData.user.id;
        console.log('✅ Supabase Auth user created:', userId);

        // Create admin record in admins table
        const { error: adminError } = await supabase
            .from('admins')
            .insert({
                id: userId,
                full_name: name,
                email: email,
                phone: phone,
                role: 'super_admin',
                is_super_admin: true,
                permissions: {
                    manageUsers: true,
                    manageContent: true,
                    manageSubAdmins: true,
                    viewAnalytics: true,
                    manageSettings: true,
                    manageBundles: true,
                    manageTests: true,
                    manageQuestions: true
                },
                created_at: new Date().toISOString()
            });

        if (adminError) {
            console.error('⚠️  Warning: Could not create admin record:', adminError.message);
            console.log('💡 The user was created in auth, but not in the admins table.');
            console.log('   You may need to add them manually or check your RLS policies.');
        } else {
            console.log('✅ Admin record created in admins table');
        }

        // Also create profile record
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                full_name: name,
                email: email,
                phone: phone,
                role: 'admin',
                created_at: new Date().toISOString()
            });

        if (profileError) {
            console.log('⚠️  Warning: Could not create profile record:', profileError.message);
        } else {
            console.log('✅ Profile record created');
        }

        console.log('\n🎉 Super Admin Account Created Successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('👤 Name:', name);
        console.log('📱 Phone:', phone);
        console.log('🆔 User ID:', userId);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n✨ You can now sign in at: http://localhost:5173/signin\n');

    } catch (error) {
        console.error('\n❌ Error creating super admin:', error.message);

        if (error.message.includes('already registered')) {
            console.log('\n💡 This email is already registered. Try signing in instead.');
        } else if (error.message.includes('password')) {
            console.log('\n💡 Password should be at least 6 characters.');
        } else if (error.message.includes('email')) {
            console.log('\n💡 Please provide a valid email address.');
        }
    } finally {
        rl.close();
        process.exit(0);
    }
}

// Run the script
createSuperAdmin();
