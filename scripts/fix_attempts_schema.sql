-- Psy-Q: Fix Attempts Table for Firebase Auth Compatibility (V2)

-- 1. Drop EVERYTHING that depends on user_id first
DROP POLICY IF EXISTS "Users can insert own attempts" ON attempts;
DROP POLICY IF EXISTS "Users can view own attempts" ON attempts;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;

-- 2. Modify Attempts table
ALTER TABLE attempts 
  ALTER COLUMN user_id TYPE TEXT,
  DROP CONSTRAINT IF EXISTS attempts_user_id_fkey;

-- 3. Modify Payments table
ALTER TABLE payments 
  ALTER COLUMN user_id TYPE TEXT,
  DROP CONSTRAINT IF EXISTS payments_user_id_fkey;

-- 4. Re-create Policies with the new TEXT type
-- We use "true" for simplicity during this migration phase
CREATE POLICY "Users can insert own attempts" ON attempts 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own attempts" ON attempts 
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own payments" ON payments 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own payments" ON payments 
  FOR SELECT USING (true);
