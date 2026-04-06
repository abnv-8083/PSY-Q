-- Fix RLS policies for bundle_tests to allow admin operations
-- This script updates the RLS policies to properly allow admins to manage bundle tests

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view bundle tests" ON bundle_tests;
DROP POLICY IF EXISTS "Admins can manage bundle tests" ON bundle_tests;

-- Recreate with proper permissions
CREATE POLICY "Public can view bundle tests" ON bundle_tests 
  FOR SELECT USING (true);

-- Allow admins to insert
CREATE POLICY "Admins can insert bundle tests" ON bundle_tests 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id::uuid = auth.uid()::uuid 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Allow admins to update
CREATE POLICY "Admins can update bundle tests" ON bundle_tests 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id::uuid = auth.uid()::uuid 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Allow admins to delete
CREATE POLICY "Admins can delete bundle tests" ON bundle_tests 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id::uuid = auth.uid()::uuid 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );
