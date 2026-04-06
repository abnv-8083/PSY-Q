-- Fix Foreign Key for user_bundles and payments

-- The application uses a custom 'students' table instead of Supabase's native 'auth.users'.
-- However, user_bundles was originally created with a foreign key referencing auth.users(id).
-- When we try to insert a student's ID, it fails because that ID is not in auth.users.
-- This script removes the old foreign key constraints.

DO $$
BEGIN
    -- Drop the constraint on user_bundles if it exists
    BEGIN
        ALTER TABLE public.user_bundles DROP CONSTRAINT user_bundles_user_id_fkey;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;

    -- Drop the constraint on payments if it exists
    BEGIN
        ALTER TABLE public.payments DROP CONSTRAINT payments_user_id_fkey;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;
END $$;
