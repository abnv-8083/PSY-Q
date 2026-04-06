-- Create Attempts Table
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  score NUMERIC DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  answers JSONB, -- Stores key-value pairs of question_index: selected_option_index
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Attempts
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

-- Policies for Attempts
CREATE POLICY "Users can insert own attempts" ON attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own attempts" ON attempts FOR SELECT USING (auth.uid() = user_id);


-- Create Payments Table (if not exists)
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

-- Enable RLS for Payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for Payments
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
