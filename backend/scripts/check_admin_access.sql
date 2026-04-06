-- Diagnostic script to check why RLS policies are blocking access
-- Run this in Supabase SQL Editor while logged in as the admin user

-- Step 1: Check what auth.uid() returns for the current user
SELECT 
    'Current User ID' as check_type,
    auth.uid() as user_id,
    auth.uid()::text as user_id_as_text;

-- Step 2: Check if the user exists in profiles table
SELECT 
    'User Profile' as check_type,
    id,
    email,
    role,
    name
FROM profiles
WHERE id = auth.uid()::text;

-- Step 3: Check if user has admin role
SELECT 
    'Admin Role Check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()::text
            AND role IN ('admin', 'sub-admin', 'superadmin')
        ) THEN 'YES - User has admin access'
        ELSE 'NO - User does NOT have admin access'
    END as has_admin_access;

-- Step 4: List all admin users
SELECT 
    'All Admin Users' as check_type,
    id,
    email,
    role,
    name
FROM profiles
WHERE role IN ('admin', 'sub-admin', 'superadmin')
ORDER BY role, email;

-- Step 5: Check RLS policies on notifications table
SELECT 
    'RLS Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'notifications';
