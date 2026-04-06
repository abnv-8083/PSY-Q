
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const sql = `
-- 8. Attempts Table
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Attempts
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

-- Check if policy exists before creating
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own attempts') THEN
        CREATE POLICY "Users can view own attempts" ON attempts FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own attempts') THEN
        CREATE POLICY "Users can insert own attempts" ON attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
`;

async function setup() {
    console.log("Setting up attempts table...");
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
        console.error("Error setting up attempts table:", error);
    } else {
        console.log("Attempts table setup complete!");
    }
}

setup();
