-- Add colours column (JSONB array of colour names) to products table
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS colours JSONB DEFAULT '[]'::JSONB;

-- Also ensure colour_data exists (migration 003 may have been skipped)
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS colour_data JSONB DEFAULT '{}'::JSONB;
