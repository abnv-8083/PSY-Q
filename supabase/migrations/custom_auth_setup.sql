-- 1. Drop existing tables and dependencies
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;

-- 2. Create Students Table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    otp_code TEXT,
    otp_expires_at TIMESTAMPTZ,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Admins Table
CREATE TABLE public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies
-- Lock down everything. Only Service Role (Edge Functions) can bypass RLS by default.
-- We might allow users to read their own data if they have a valid custom session token, 
-- but since we are managing sessions manually, we'll likely handle all data access via Edge Functions 
-- or by passing a specific signed token if we were using RLS. 
-- For now, we will create a policy that effectively denies all public access, 
-- relying on the Service Role key in Edge Functions to perform operations.

CREATE POLICY "No public access" ON public.students
    FOR ALL
    TO public
    USING (false);

CREATE POLICY "No public access" ON public.admins
    FOR ALL
    TO public
    USING (false);
