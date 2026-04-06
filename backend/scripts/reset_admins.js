import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function resetAdmins() {
    console.log('--- RESETTING ADMINS ---');

    // 1. Delete all admins
    const { error: deleteError } = await supabase
        .from('admins')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
        console.error('Error clearing admins table:', deleteError);
        process.exit(1);
    }
    console.log('Successfully cleared admins table.');

    // 2. Create new super admin
    const email = 'admin@psyq.com';
    const password = 'psyq_super_admin_2024!'; // Temporary secure password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newAdmin = {
        email: email,
        password_hash: hash,
        full_name: 'Main Super Admin',
        role: 'super_admin',
        is_blocked: false,
        permissions: {
            manageBundles: true,
            manageContent: true,
            manageUsers: true,
            viewAnalytics: true
        }
    };

    const { data: inserted, error: insertError } = await supabase
        .from('admins')
        .insert(newAdmin)
        .select();

    if (insertError) {
        console.error('Error creating new super admin:', insertError);
        process.exit(1);
    }

    console.log('\n--- NEW SUPER ADMIN CREATED ---');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('FullName:', newAdmin.full_name);
    console.log('Role:', newAdmin.role);
    console.log('Permissions:', JSON.stringify(newAdmin.permissions));
    console.log('-------------------------------\n');
    console.log('IMPORTANT: Please change this password immediately after logging in.');

    process.exit(0);
}

resetAdmins();
