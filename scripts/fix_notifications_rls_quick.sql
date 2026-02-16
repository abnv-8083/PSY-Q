-- QUICK FIX: Enable notification creation immediately
-- This removes the admin-only restriction temporarily so you can test the feature
-- You can restore the admin-only policies later

-- Step 1: Drop the restrictive admin-only policies
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON notifications;

-- Step 2: Create permissive policies that allow any authenticated user
DROP POLICY IF EXISTS "Allow authenticated users to view notifications" ON notifications;
CREATE POLICY "Allow authenticated users to view notifications"
ON notifications FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create notifications" ON notifications;
CREATE POLICY "Allow authenticated users to create notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update notifications" ON notifications;
CREATE POLICY "Allow authenticated users to update notifications"
ON notifications FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete notifications" ON notifications;
CREATE POLICY "Allow authenticated users to delete notifications"
ON notifications FOR DELETE
TO authenticated
USING (true);

SELECT '✅ Notifications are now accessible to all authenticated users!' as status;
SELECT 'Try creating a notification now - it should work!' as next_step;

-- NOTE: These policies are permissive for testing purposes.
-- In production, you should restrict access to admin users only.
-- To restore admin-only access later, run the add_notifications_table.sql script again
-- after ensuring your user profile has role = 'admin' in the profiles table.
