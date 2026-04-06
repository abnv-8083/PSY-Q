-- Fix RLS Policies for Admin Manual Approvals (user_bundles, payments)

-- Since the application uses custom authentication and Edge Functions for login,
-- the Supabase Javascript Client executes queries anonymously.
-- For the frontend to insert into these tables upon approval, they need public insert/update access.

-- 1. user_bundles
CREATE POLICY "Enable public select for user_bundles"
    ON public.user_bundles
    FOR SELECT
    USING (true);

CREATE POLICY "Enable public insert for user_bundles"
    ON public.user_bundles
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable public update for user_bundles"
    ON public.user_bundles
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 2. payments
CREATE POLICY "Enable public select for payments"
    ON public.payments
    FOR SELECT
    USING (true);

CREATE POLICY "Enable public insert for payments"
    ON public.payments
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable public update for payments"
    ON public.payments
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
