
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const sql = `
-- 9. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_id TEXT UNIQUE,
  order_id TEXT,
  signature TEXT,
  status TEXT DEFAULT 'success',
  type TEXT, -- 'bundle' or 'test'
  item_id UUID, -- bundle_id or test_id
  item_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own payments') THEN
        CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own payments') THEN
        CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
`;

async function setup() {
    console.log("Setting up payments table...");
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
        console.error("Error setting up payments table:", error);
    } else {
        console.log("Payments table setup complete!");
    }
}

setup();
