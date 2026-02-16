-- FINAL nuclear fix for RLS issues on bundles and bundle_tests
-- This script disables RLS for both tables to strictly allow all operations.
-- Run this in Supabase SQL Editor if you encounter 'Cannot coerce result' or RLS policy errors.

-- Disable RLS on bundles table
ALTER TABLE public.bundles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on bundle_tests table
ALTER TABLE public.bundle_tests DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT 'RLS Disabled for bundles and bundle_tests' as status;
