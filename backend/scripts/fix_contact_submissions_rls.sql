-- Fix for Contact Submissions not appearing in Admin Dashboard
-- This updates the RLS policy to properly allow admins to view all submissions

-- Drop the existing admin policy
DROP POLICY IF EXISTS "Admins can view all submissions" ON contact_submissions;

-- Create a more permissive admin policy that checks for multiple admin role types
-- Fixed: Cast auth.uid() to TEXT to match profiles.id type
CREATE POLICY "Admins can view all submissions"
    ON contact_submissions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()::text
            AND profiles.role IN ('admin', 'sub-admin', 'superadmin')
        )
    );

-- Alternative: If the above doesn't work, you can temporarily make all submissions viewable
-- by authenticated users for debugging. Uncomment the lines below:

-- DROP POLICY IF EXISTS "Admins can view all submissions" ON contact_submissions;
-- CREATE POLICY "Authenticated users can view all submissions"
--     ON contact_submissions
--     FOR SELECT
--     TO authenticated
--     USING (true);
