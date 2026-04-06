-- Add Super Admin to admins table
-- Run this in Supabase SQL Editor after creating the user via the script

-- Add the super admin user (replace the ID with the one from the script output)
INSERT INTO admins (
    id,
    full_name,
    email,
    created_at
) VALUES (
    '03d18f07-4b65-4d63-b66b-89d14bc007dd', -- User ID from script output
    'Super Admin',
    'admin@psyq.com',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

-- Also add to profiles table
INSERT INTO profiles (
    id,
    full_name,
    email,
    role,
    created_at
) VALUES (
    '03d18f07-4b65-4d63-b66b-89d14bc007dd', -- Same User ID
    'Super Admin',
    'admin@psyq.com',
    'admin',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role;

-- Verify the admin was added
SELECT * FROM admins WHERE email = 'admin@psyq.com';
SELECT * FROM profiles WHERE email = 'admin@psyq.com';
