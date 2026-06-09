-- YARO: Add colour_data JSONB column for per-colour images
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS colour_data JSONB DEFAULT '{}'::JSONB;
