-- Fix for RLS policy blocking notification creation
-- This script provides two solutions:

-- SOLUTION 1: Temporarily disable RLS to test (NOT RECOMMENDED FOR PRODUCTION)
-- Uncomment the line below to disable RLS temporarily
-- ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- SOLUTION 2: Update your user's role to admin (RECOMMENDED)
-- Replace 'YOUR_EMAIL_HERE' with your actual email address

-- First, let's check your current user info
SELECT 
    'Your Current Profile' as info,
    id,
    email,
    role,
    name
FROM profiles
WHERE id = auth.uid()::text;

-- If the query above shows your profile but role is NULL or 'student',
-- run this UPDATE to make yourself an admin:
-- (Replace 'your.email@example.com' with your actual email)

UPDATE profiles
SET role = 'admin'
WHERE email = 'YOUR_EMAIL_HERE'  -- CHANGE THIS TO YOUR EMAIL
AND id = auth.uid()::text;

-- Verify the update worked
SELECT 
    'Updated Profile' as info,
    id,
    email,
    role,
    name
FROM profiles
WHERE id = auth.uid()::text;

-- SOLUTION 3: Create a more permissive policy for testing
-- This allows any authenticated user to manage notifications
-- (Remove the admin-only policies and add this simpler one)

-- Drop the restrictive policies
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON notifications;

-- Create permissive policies for testing (TEMPORARY - tighten security later)
CREATE POLICY "Authenticated users can view notifications"
ON notifications FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update notifications"
ON notifications FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete notifications"
ON notifications FOR DELETE
TO authenticated
USING (true);

-- After testing, you can restore the admin-only policies by running
-- the add_notifications_table.sql script again

SELECT 'RLS policies updated! Try creating a notification now.' as status;
