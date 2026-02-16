-- FINAL FIX: Complete RLS reset for notifications table
-- This script will completely reset all policies and create the simplest possible setup

-- Step 1: Drop ALL existing policies (both old and new)
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON notifications;
DROP POLICY IF EXISTS "Allow authenticated users to view notifications" ON notifications;
DROP POLICY IF EXISTS "Allow authenticated users to create notifications" ON notifications;
DROP POLICY IF EXISTS "Allow authenticated users to update notifications" ON notifications;
DROP POLICY IF EXISTS "Allow authenticated users to delete notifications" ON notifications;

-- Step 2: Temporarily disable RLS to verify table works
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Step 3: Test if you can now create notifications
-- If this works, the issue is definitely RLS-related

SELECT 'RLS has been DISABLED for notifications table.' as status;
SELECT 'Try creating a notification now. It should work!' as next_step;
SELECT 'WARNING: This is NOT secure for production. Re-enable RLS after testing.' as warning;

-- Step 4: (Optional) Re-enable RLS with the simplest possible policy
-- Uncomment the lines below after verifying notifications work:

-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Allow all operations for authenticated users"
-- ON notifications
-- TO authenticated
-- USING (true)
-- WITH CHECK (true);
