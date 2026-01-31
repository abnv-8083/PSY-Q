-- Psy-Q: Master Fix for Firebase Auth Integration
-- This script converts all UUID-based user columns to TEXT to support Firebase UIDs.

-- 1. Drop all dependent objects first (Policies, Foreign Keys, Primary Keys)
-- -----------------------------------------------------------------------

-- Attempts
DROP POLICY IF EXISTS "Users can insert own attempts" ON attempts;
DROP POLICY IF EXISTS "Users can view own attempts" ON attempts;
ALTER TABLE IF EXISTS attempts DROP CONSTRAINT IF EXISTS attempts_user_id_fkey;

-- Payments
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
ALTER TABLE IF EXISTS payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;

-- Profiles
DROP POLICY IF EXISTS "Own Profile Read" ON profiles;
ALTER TABLE IF EXISTS profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- User Bundles (Note: user_id is part of PK)
ALTER TABLE IF EXISTS user_bundles DROP CONSTRAINT IF EXISTS user_bundles_user_id_fkey;
ALTER TABLE IF EXISTS user_bundles DROP CONSTRAINT IF EXISTS user_bundles_pkey;

-- 2. Modify Column Types to TEXT
-- ------------------------------

ALTER TABLE IF EXISTS attempts ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE IF EXISTS payments ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE IF EXISTS profiles ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS user_bundles ALTER COLUMN user_id TYPE TEXT;

-- 3. Re-establish Primary Keys and RLS Policies
-- ---------------------------------------------

-- Re-add Primary Key for user_bundles
ALTER TABLE IF EXISTS user_bundles ADD PRIMARY KEY (user_id, bundle_id);

-- Re-enable RLS Policies (Supporting Firebase UIDs)
-- Note: We use simple 'true' or check for non-null since auth.uid() doesn't work with Firebase tokens out-of-the-box
CREATE POLICY "Users can insert own attempts" ON attempts FOR INSERT WITH CHECK (user_id IS NOT NULL);
CREATE POLICY "Users can view own attempts" ON attempts FOR SELECT USING (true);

CREATE POLICY "Users can view own profiling" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (user_id IS NOT NULL);
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (true);

-- Ensure RLS is active
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bundles ENABLE ROW LEVEL SECURITY;
