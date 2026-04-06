-- Psy-Q Bundle Management System Migration
-- This script migrates the bundles table to support fixed bundle types with pricing features

-- Step 1: Backup existing data
CREATE TABLE IF NOT EXISTS bundles_backup AS SELECT * FROM bundles;
CREATE TABLE IF NOT EXISTS bundle_tests_backup AS SELECT * FROM bundle_tests;
CREATE TABLE IF NOT EXISTS user_bundles_backup AS SELECT * FROM user_bundles;

-- Step 2: Drop existing tables (cascade to remove dependencies)
DROP TABLE IF EXISTS user_bundles CASCADE;
DROP TABLE IF EXISTS bundle_tests CASCADE;
DROP TABLE IF EXISTS bundles CASCADE;

-- Step 3: Create enhanced bundles table
CREATE TABLE bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_type TEXT NOT NULL UNIQUE CHECK (bundle_type IN ('BASIC', 'ADVANCED', 'PREMIUM')),
  name TEXT NOT NULL,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb, -- Array of feature strings
  regular_price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (regular_price >= 0),
  offer_price NUMERIC(10,2) CHECK (offer_price >= 0 AND offer_price <= regular_price),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_bundles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bundles_updated_at_trigger
BEFORE UPDATE ON bundles
FOR EACH ROW
EXECUTE FUNCTION update_bundles_updated_at();

-- Step 5: Create Bundle Tests Junction Table
CREATE TABLE bundle_tests (
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (bundle_id, test_id)
);

-- Step 6: Create User Bundles Table
CREATE TABLE user_bundles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  price_paid NUMERIC(10,2), -- Track actual price paid
  PRIMARY KEY (user_id, bundle_id)
);

-- Step 7: Enable Row Level Security
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bundles ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS Policies for bundles
CREATE POLICY "Public can view active bundles" ON bundles 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage bundles" ON bundles 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id::uuid = auth.uid()::uuid 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Step 9: Create RLS Policies for bundle_tests
CREATE POLICY "Public can view bundle tests" ON bundle_tests 
  FOR SELECT USING (true);

-- Separate policies for each operation to ensure proper permissions
CREATE POLICY "Admins can insert bundle tests" ON bundle_tests 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id::uuid = auth.uid()::uuid 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update bundle tests" ON bundle_tests 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id::uuid = auth.uid()::uuid 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete bundle tests" ON bundle_tests 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id::uuid = auth.uid()::uuid 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Step 10: Create RLS Policies for user_bundles
CREATE POLICY "Users can view own bundles" ON user_bundles 
  FOR SELECT USING (auth.uid()::uuid = user_id::uuid);

CREATE POLICY "Users can purchase bundles" ON user_bundles 
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id::uuid);

CREATE POLICY "Admins can view all user bundles" ON user_bundles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id::uuid = auth.uid()::uuid 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Step 11: Insert fixed bundles with initial data
INSERT INTO bundles (bundle_type, name, description, features, regular_price, offer_price, display_order) VALUES
('BASIC', 'Basic Plan', 'Essential resources for UGC NET Psychology preparation', 
 '["12+ Years of PYQs", "Full-Length Mock Tests", "1500+ Expert Explanations", "6 Months Validity"]'::jsonb,
 499.00, NULL, 1),
('ADVANCED', 'Advanced Plan', 'Comprehensive preparation with topic-wise practice',
 '["12+ Years of PYQs", "Topic-Wise Questions", "2000+ Expert Explanations", "6 Months Validity"]'::jsonb,
 999.00, NULL, 2),
('PREMIUM', 'Premium Plan', 'Complete preparation package with extended validity',
 '["12+ Years of PYQs", "Topic-Wise Questions", "2500+ Expert Explanations", "1 Year Validity"]'::jsonb,
 1499.00, NULL, 3);

-- Step 12: Create indexes for performance
CREATE INDEX idx_bundles_bundle_type ON bundles(bundle_type);
CREATE INDEX idx_bundles_is_active ON bundles(is_active);
CREATE INDEX idx_bundle_tests_bundle_id ON bundle_tests(bundle_id);
CREATE INDEX idx_bundle_tests_test_id ON bundle_tests(test_id);
CREATE INDEX idx_user_bundles_user_id ON user_bundles(user_id);
CREATE INDEX idx_user_bundles_bundle_id ON user_bundles(bundle_id);

-- Migration complete!
-- To verify, run: SELECT * FROM bundles ORDER BY display_order;
