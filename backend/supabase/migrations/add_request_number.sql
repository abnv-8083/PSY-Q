-- Add request_number column to purchase_requests

ALTER TABLE public.purchase_requests ADD COLUMN IF NOT EXISTS request_number VARCHAR(10) UNIQUE;
