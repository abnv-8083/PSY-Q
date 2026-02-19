-- FINAL PSY-Q STUDENT MANAGEMENT FIX
-- This script ensures the database is fully compatible with the Student Management dashboard.

-- 1. Ensure 'is_suspended' column exists on students table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pf_get_columns('students') WHERE name = 'is_suspended') THEN
        ALTER TABLE students ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE;
    END IF;
EXCEPTION
    WHEN undefined_function THEN
        -- Fallback if policy helper doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'is_suspended') THEN
            ALTER TABLE students ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE;
        END IF;
END $$;

-- 2. Update Students Table Policies
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

-- 3. Analytics Helper Policies
DROP POLICY IF EXISTS "Admins can view all attempts" ON attempts;
CREATE POLICY "Admins can view all attempts" ON attempts FOR SELECT USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
