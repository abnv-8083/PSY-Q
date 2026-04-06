-- Diagnostic and Fix Script for Bundle Tests RLS Issues
-- Run this script to diagnose and fix RLS policy problems

-- STEP 1: Check current user's profile and role
SELECT 
    auth.uid() as current_user_id,
    p.id as profile_id,
    p.email,
    p.role
FROM profiles p
WHERE p.id = auth.uid();

-- STEP 2: Check existing RLS policies on bundle_tests
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'bundle_tests';

-- STEP 3: Drop ALL existing policies on bundle_tests
DROP POLICY IF EXISTS "Public can view bundle tests" ON bundle_tests;
DROP POLICY IF EXISTS "Admins can manage bundle tests" ON bundle_tests;
DROP POLICY IF EXISTS "Admins can insert bundle tests" ON bundle_tests;
DROP POLICY IF EXISTS "Admins can update bundle tests" ON bundle_tests;
DROP POLICY IF EXISTS "Admins can delete bundle tests" ON bundle_tests;

-- STEP 4: Create simplified RLS policies that work with Supabase auth
-- Allow everyone to view bundle tests
CREATE POLICY "allow_select_bundle_tests" ON bundle_tests 
  FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Allow authenticated users with admin role to insert
CREATE POLICY "allow_insert_bundle_tests" ON bundle_tests 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Allow authenticated users with admin role to delete
CREATE POLICY "allow_delete_bundle_tests" ON bundle_tests 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- STEP 5: Verify policies were created
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'bundle_tests'
ORDER BY policyname;

-- STEP 6: Test if current user can insert (should return true for admins)
SELECT 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'superadmin')
    ) as can_manage_bundles;
