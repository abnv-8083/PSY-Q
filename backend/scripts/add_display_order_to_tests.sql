-- Add display_order column to tests table
ALTER TABLE tests ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Initialize display_order with existing creation order
WITH ordered_tests AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY subject_id ORDER BY created_at ASC) as row_num
  FROM tests
)
UPDATE tests
SET display_order = ordered_tests.row_num
FROM ordered_tests
WHERE tests.id = ordered_tests.id;
