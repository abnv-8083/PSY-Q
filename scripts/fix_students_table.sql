-- Psy-Q Students Table Fix
-- This script ensures the students table exists and has the correct schema to match the application code.

-- 1. Create or Update Students Table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add full_name if it doesn't exist (in case table was created with 'name')
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='full_name') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='name') THEN
            ALTER TABLE students RENAME COLUMN name TO full_name;
        ELSE
            ALTER TABLE students ADD COLUMN full_name TEXT;
        END IF;
    END IF;
END $$;

-- 3. Enable RLS for Students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- 4. Set up Policies
DROP POLICY IF EXISTS "Users can view own student profile" ON students;
CREATE POLICY "Users can view own student profile" ON students FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own student profile" ON students;
CREATE POLICY "Users can update own student profile" ON students FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own student profile" ON students;
CREATE POLICY "Users can insert own student profile" ON students FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Refresh schema cache
NOTIFY pgrst, 'reload schema';
