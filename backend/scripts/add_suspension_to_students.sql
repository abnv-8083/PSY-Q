-- Migration to add suspension support to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
