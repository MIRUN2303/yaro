-- ─── HOMEPAGE CONTENT TABLE ───
CREATE TABLE IF NOT EXISTS homepage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title TEXT DEFAULT 'WEAR WHAT STAYS WITH YOU.',
  hero_subtitle TEXT DEFAULT 'Every Collection Begins Somewhere',
  cta_text TEXT DEFAULT 'Explore Store',
  featured_collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  featured_story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  about_text TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SITE SETTINGS TABLE ───
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT DEFAULT 'YARO',
  site_description TEXT DEFAULT 'Every Collection Begins Somewhere',
  admin_email TEXT DEFAULT '',
  currency TEXT DEFAULT 'INR',
  social_links JSONB DEFAULT '{}',
  shipping_fee NUMERIC(10,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE homepage ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read homepage" ON homepage FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

-- Service role full access (admin operations use service key)
CREATE POLICY "Service full access homepage" ON homepage FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service full access settings" ON settings FOR ALL USING (auth.role() = 'service_role');

-- Insert default rows
INSERT INTO homepage (hero_title, hero_subtitle, cta_text, about_text)
VALUES ('WEAR WHAT STAYS WITH YOU.', 'Every Collection Begins Somewhere', 'Explore Store', '')
ON CONFLICT DO NOTHING;

INSERT INTO settings (site_name, site_description, currency, social_links, shipping_fee, tax_rate)
VALUES ('YARO', 'Every Collection Begins Somewhere', 'INR', '{}', 0, 0)
ON CONFLICT DO NOTHING;
