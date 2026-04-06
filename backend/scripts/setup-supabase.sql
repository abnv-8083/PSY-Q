-- Psy-Q Supabase Schema Setup

-- 1. Subjects Table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tests Table
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC DEFAULT 0,
  duration INTEGER DEFAULT 100, -- in minutes
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Questions Table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of strings
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bundles Table
CREATE TABLE bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Bundle Tests (Junction table)
CREATE TABLE bundle_tests (
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  PRIMARY KEY (bundle_id, test_id)
);

-- 6. User Profiles (Extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. User Bundles (Tracks purchases)
CREATE TABLE user_bundles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, bundle_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bundles ENABLE ROW LEVEL SECURITY;

-- Simple Policies (Everyone can READ everything for now)
CREATE POLICY "Public Read Subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public Read Tests" ON tests FOR SELECT USING (true);
CREATE POLICY "Public Read Questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Public Read Bundles" ON bundles FOR SELECT USING (true);
CREATE POLICY "Public Read Bundle Tests" ON bundle_tests FOR SELECT USING (true);
CREATE POLICY "Own Profile Read" ON profiles FOR SELECT USING (auth.uid() = id);
