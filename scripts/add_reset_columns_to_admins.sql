-- Add reset token columns to admins table
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_expires_at TIMESTAMPTZ;
