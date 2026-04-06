-- Psy-Q Admin Permissions Fix
-- This script grants administrators full access to manage students, attempts, and payments.

-- 1. Students Table Policies
DROP POLICY IF EXISTS "Admins can view all students" ON students;
CREATE POLICY "Admins can view all students" ON students FOR SELECT USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can update students" ON students;
CREATE POLICY "Admins can update students" ON students FOR UPDATE USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can delete students" ON students;
CREATE POLICY "Admins can delete students" ON students FOR DELETE USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);


-- 2. Attempts Table Policies (For Analytics)
DROP POLICY IF EXISTS "Admins can view all attempts" ON attempts;
CREATE POLICY "Admins can view all attempts" ON attempts FOR SELECT USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);


-- 3. Payments Table Policies (For Analytics)
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- 4. User Bundles Policies (For Analytics)
DROP POLICY IF EXISTS "Admins can view all user bundles" ON user_bundles;
CREATE POLICY "Admins can view all user bundles" ON user_bundles FOR SELECT USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
