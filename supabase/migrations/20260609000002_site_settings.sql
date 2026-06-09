-- Migration 004: Site Settings table
-- Admin controls website content dynamically via key-value pairs

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  value JSONB DEFAULT '{}'::JSONB,
  label TEXT DEFAULT '',
  description TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read site settings (they control public site content)
DROP POLICY IF EXISTS "Anyone can read site settings" ON site_settings;
CREATE POLICY "Anyone can read site settings"
  ON site_settings FOR SELECT
  USING (true);

-- Only admin can modify settings
DROP POLICY IF EXISTS "Admin can manage site settings" ON site_settings;
CREATE POLICY "Admin can manage site settings"
  ON site_settings FOR ALL
  USING (auth.jwt() ->> 'email' = 'yarodrops@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'yarodrops@gmail.com');

-- Seed default settings
INSERT INTO site_settings (id, value, label, description) VALUES
  ('announcement', '{"text": "", "enabled": false}'::JSONB, 'Announcement Bar', 'Site-wide announcement text shown at the top of every page'),
  ('store_banner', '{"heading": "Every Collection Begins Somewhere", "subheading": "Stories you can wear", "enabled": true}'::JSONB, 'Store Banner', 'Heading and subheading on the store page'),
  ('social_links', '{"instagram": "", "facebook": "", "twitter": ""}'::JSONB, 'Social Links', 'Social media profile URLs for the footer')
ON CONFLICT (id) DO NOTHING;
