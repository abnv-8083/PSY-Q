-- Psy-Q Full Access Fix
-- This script adds RLS policies to allow INSERT, UPDATE, and DELETE operations.
-- Currently, only SELECT policies exist, which is why deleting/editing fails.

-- 1. Enable RLS and add full policies for Subjects
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All Subjects" ON subjects;
CREATE POLICY "Allow All Subjects" ON subjects FOR ALL USING (true) WITH CHECK (true);

-- 2. Enable RLS and add full policies for Tests
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All Tests" ON tests;
CREATE POLICY "Allow All Tests" ON tests FOR ALL USING (true) WITH CHECK (true);

-- 3. Enable RLS and add full policies for Questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All Questions" ON questions;
CREATE POLICY "Allow All Questions" ON questions FOR ALL USING (true) WITH CHECK (true);

-- 4. Enable RLS and add full policies for Bundles
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All Bundles" ON bundles;
CREATE POLICY "Allow All Bundles" ON bundles FOR ALL USING (true) WITH CHECK (true);

-- 5. Enable RLS and add full policies for Bundle Tests (Junction)
ALTER TABLE bundle_tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All Bundle Tests" ON bundle_tests;
CREATE POLICY "Allow All Bundle Tests" ON bundle_tests FOR ALL USING (true) WITH CHECK (true);

-- 6. Ensure Attempts and Payments also have full logic (if not already handled)
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All Attempts" ON attempts;
CREATE POLICY "Allow All Attempts" ON attempts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All Payments" ON payments;
CREATE POLICY "Allow All Payments" ON payments FOR ALL USING (true) WITH CHECK (true);
