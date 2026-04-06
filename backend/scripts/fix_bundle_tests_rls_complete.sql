-- Complete fix for bundle_tests RLS policies
-- This script removes all existing policies and creates clean ones

-- Step 1: Drop ALL existing policies on bundle_tests
DROP POLICY IF EXISTS "Public can view bundle tests" ON bundle_tests;
DROP POLICY IF EXISTS "Admins can manage bundle tests" ON bundle_tests;
DROP POLICY IF EXISTS "Admins can insert bundle tests" ON bundle_tests;
DROP POLICY IF EXISTS "Admins can update bundle tests" ON bundle_tests;
DROP POLICY IF EXISTS "Admins can delete bundle tests" ON bundle_tests;
DROP POLICY IF EXISTS "temp_allow_all_authenticated" ON bundle_tests;
DROP POLICY IF EXISTS "allow_select_bundle_tests" ON bundle_tests;
DROP POLICY IF EXISTS "allow_insert_bundle_tests" ON bundle_tests;
DROP POLICY IF EXISTS "allow_delete_bundle_tests" ON bundle_tests;

-- Step 2: Create simple, working policies
-- Allow everyone to view
CREATE POLICY "bundle_tests_select" ON bundle_tests 
  FOR SELECT 
  USING (true);

-- Allow all authenticated users to manage (temporary - can be restricted later)
CREATE POLICY "bundle_tests_insert" ON bundle_tests 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "bundle_tests_delete" ON bundle_tests 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Verify policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'bundle_tests';
