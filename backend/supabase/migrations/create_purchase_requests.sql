-- 1. Drop existing table if it exists
DROP TABLE IF EXISTS public.purchase_requests CASCADE;

-- 2. Create Purchase Requests Table
CREATE TABLE public.purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.students(id) ON DELETE CASCADE, -- Ensure this references the right custom auth table. Assuming 'students'. We can also drop the foreign key if it's generic, but let's stick to students for now.
    item_type TEXT CHECK (item_type IN ('test', 'bundle')),
    item_id UUID NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;

-- 4. Create Public Policies since the app uses custom authentication (auth.uid() is null)
CREATE POLICY "Enable insert for everyone"
    ON public.purchase_requests
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable select for everyone"
    ON public.purchase_requests
    FOR SELECT
    USING (true);

CREATE POLICY "Enable update for everyone"
    ON public.purchase_requests
    FOR UPDATE
    USING (true);
