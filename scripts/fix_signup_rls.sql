-- Final RLS Fix for Student and Admin Signup
-- This script ensures that all required tables exist and allow INSERT during signup.

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert profiles" ON public.profiles;
CREATE POLICY "Public can insert profiles" 
ON public.profiles FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert students" ON public.students;
CREATE POLICY "Public can insert students" 
ON public.students FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Students can view own record" ON public.students;
CREATE POLICY "Students can view own record" 
ON public.students FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Students can update own record" ON public.students;
CREATE POLICY "Students can update own record" 
ON public.students FOR UPDATE 
USING (auth.uid() = id);

-- 3. Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view admins" ON public.admins;
CREATE POLICY "Anyone can view admins" ON public.admins FOR SELECT USING (true);
