-- Add missing gender column to products table
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS gender VARCHAR(50) DEFAULT 'Any';
