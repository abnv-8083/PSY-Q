-- Migration to add display_order and year for reordering and filtering
ALTER TABLE tests ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
