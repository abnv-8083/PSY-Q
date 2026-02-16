-- SIMPLEST FIX: Just allow authenticated users to manage bundle_tests
-- Run this single script in Supabase SQL Editor

-- Remove all existing policies
DROP POLICY IF EXISTS "Public can view bundle tests" ON bundle_tests;
DROP POLICY IF EXISTS "Admins can manage bundle tests" ON bundle_tests;
DROP POLICY IF EXISTS "Admins can insert bundle tests" ON bundle_tests;
DROP POLICY IF EXISTS "Admins can update bundle tests" ON bundle_tests;
DROP POLICY IF EXISTS "Admins can delete bundle tests" ON bundle_tests;
DROP POLICY IF EXISTS "temp_allow_all_authenticated" ON bundle_tests;
DROP POLICY IF EXISTS "allow_select_bundle_tests" ON bundle_tests;
DROP POLICY IF EXISTS "allow_insert_bundle_tests" ON bundle_tests;
DROP POLICY IF EXISTS "allow_delete_bundle_tests" ON bundle_tests;
DROP POLICY IF EXISTS "bundle_tests_select" ON bundle_tests;
DROP POLICY IF EXISTS "bundle_tests_insert" ON bundle_tests;
DROP POLICY IF EXISTS "bundle_tests_delete" ON bundle_tests;

-- Create ONE simple policy that works
CREATE POLICY "authenticated_users_full_access" 
ON bundle_tests 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify it was created
SELECT 'Policy created successfully!' as status;
