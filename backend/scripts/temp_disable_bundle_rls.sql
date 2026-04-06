-- EMERGENCY FIX: Temporarily disable RLS on bundle_tests for testing
-- WARNING: This removes security. Only use for testing, then re-enable with proper policies.

-- Option 1: Disable RLS entirely (NOT RECOMMENDED for production)
-- ALTER TABLE bundle_tests DISABLE ROW LEVEL SECURITY;

-- Option 2: Create a permissive policy for authenticated users (TEMPORARY)
DROP POLICY IF EXISTS "temp_allow_all_authenticated" ON bundle_tests;

CREATE POLICY "temp_allow_all_authenticated" ON bundle_tests 
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- After this works, you should replace with proper role-based policies
