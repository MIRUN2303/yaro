-- YARO Database Schema
-- Run this in Supabase SQL Editor

-- 1. COLLECTIONS
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STORIES
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  story_content TEXT,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  sale_price INTEGER,
  stock INTEGER DEFAULT 0,
  sku VARCHAR(100),
  images TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active',
  category VARCHAR(255),
  badge VARCHAR(100),
  badge_class VARCHAR(50),
  story_text TEXT,
  original_price INTEGER,
  offer_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USERS (managed by Supabase Auth, this is a local mirror)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CARTS
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 6. CART ITEMS
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(20),
  quantity INTEGER DEFAULT 1,
  bucket_name VARCHAR(255) DEFAULT 'My Cart',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  subtotal INTEGER NOT NULL,
  shipping INTEGER DEFAULT 0,
  tax INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  fulfillment_status VARCHAR(50) DEFAULT 'pending',
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255),
  size VARCHAR(20),
  quantity INTEGER DEFAULT 1,
  price INTEGER NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_collection_id ON products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_story_id ON products(story_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_stories_collection_id ON stories(collection_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Enable Row Level Security (optional, managed via Supabase)
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Seed data: Collections based on existing frontend categories
INSERT INTO collections (name, slug, description) VALUES
  ('Night Ride', 'night-ride', 'The quiet roads know every dream that never reached daylight.'),
  ('Urban Echo', 'urban-echo', 'Born of the pavement, thriving in the noise of the crowded street.'),
  ('Midnight Society', 'midnight-society', 'Sneaking out into the cool night, leaving the city behind.'),
  ('Wander', 'wander', 'Not all who wander are looking for a way home.')
ON CONFLICT (slug) DO NOTHING;

-- Seed Stories
WITH night_ride AS (SELECT id FROM collections WHERE slug='night-ride'),
     urban_echo AS (SELECT id FROM collections WHERE slug='urban-echo'),
     midnight_society AS (SELECT id FROM collections WHERE slug='midnight-society'),
     wander AS (SELECT id FROM collections WHERE slug='wander')
INSERT INTO stories (collection_id, title, slug, description, story_content)
SELECT c.id, s.title, s.slug, s.description, s.story_content
FROM (VALUES
  ((SELECT id FROM night_ride), 'Midnight Drift', 'midnight-drift', 'Chapter I', 'The quiet roads know every dream that never reached daylight.'),
  ((SELECT id FROM night_ride), 'City Lights', 'city-lights', 'Chapter II', 'Lost in the neon glow, chasing shadows of a life we used to know.'),
  ((SELECT id FROM night_ride), 'Empty Roads', 'empty-roads', 'Chapter III', 'No destination, just the cold wind and the open path ahead.'),
  ((SELECT id FROM urban_echo), 'Concrete Soul', 'concrete-soul', 'Chapter I', 'Born of the pavement, thriving in the noise of the crowded street.'),
  ((SELECT id FROM urban_echo), 'Lost Signal', 'lost-signal', 'Chapter II', 'A frequency cut short, a voice fading into static.'),
  ((SELECT id FROM urban_echo), 'Silent Crowd', 'silent-crowd', 'Chapter III', 'Surrounded by thousands, yet walking in absolute silence.'),
  ((SELECT id FROM midnight_society), 'Late Escape', 'late-escape', 'Chapter I', 'Sneaking out into the cool night, leaving the city behind.'),
  ((SELECT id FROM wander), 'Lost Path', 'lost-path', 'Chapter I', 'Not all who wander are looking for a way home.')
) AS s(collection_id, title, slug, description, story_content)
CROSS JOIN collections c
WHERE c.id = s.collection_id
ON CONFLICT (slug) DO NOTHING;

-- Seed Products (matching existing frontend productsDB)
WITH collections_map AS (SELECT id, slug FROM collections),
     stories_map AS (SELECT id, slug FROM stories)
INSERT INTO products (collection_id, story_id, name, slug, description, price, original_price, sale_price, stock, sku, images, sizes, status, category, badge, badge_class, story_text, offer_name)
SELECT
  c.id,
  s.id,
  p.name, p.slug, p.description, p.price, p.original_price, p.sale_price, p.stock, p.sku, p.images, p.sizes, p.status, p.category, p.badge, p.badge_class, p.story_text, p.offer_name
FROM (VALUES
  ('night-ride', 'midnight-drift', 'Midnight Drift', 'obsidian-lava-tee', 'A signature heavyweight black t-shirt with structured chest layout, boxy drop-shoulder fit, and high-density print detail.', 899, 1499, NULL, 50, 'YARO-001', ARRAY['images/detail_pics/center_model.png','images/detail_pics/left_back.png','images/detail_pics/right_front.png'], ARRAY['S','M','L','XL','XXL'], 'active', 'Night Ride', 'Chapter', 'bestseller', 'The quiet roads know every dream that never reached daylight.', 'Flash Sale'),
  ('night-ride', 'city-lights', 'City Lights', 'violet-haze-hoodie', 'Heavyweight combed ringspun cotton with drop-shoulder silhouette, massive structured hood, and relaxed cuffs.', 899, 1499, NULL, 40, 'YARO-002', ARRAY['images/violet_haze_hoodie.png'], ARRAY['S','M','L','XL','XXL'], 'active', 'Night Ride', 'Chapter', 'bestseller', 'Lost in the neon glow, chasing shadows of a life we used to know.', 'Flash Sale'),
  ('night-ride', 'empty-roads', 'Empty Roads', 'shadow-cargo-pant', 'Technical shadow cargo pant engineered with heavy nylon cotton canvas, deep modular pockets, dual side utility straps, and matte steel adjustment hardware.', 899, 1499, NULL, 30, 'YARO-003', ARRAY['images/shadow_cargo_pant.png'], ARRAY['S','M','L','XL','XXL'], 'active', 'Night Ride', 'New', 'new', 'No destination, just the cold wind and the open path ahead.', 'Season Sale'),
  ('urban-echo', 'concrete-soul', 'Concrete Soul', 'crop-lacroix-tee', 'Minimalist off-white crop tee crafted with organic soft rib cotton, structured box fit drape, and double stitch hem details.', 899, 1399, NULL, 45, 'YARO-004', ARRAY['images/crop_lacroix_tee.png'], ARRAY['S','M','L','XL','XXL'], 'active', 'Urban Echo', 'Chapter', 'bestseller', 'Born of the pavement, thriving in the noise of the crowded street.', 'Flash Sale'),
  ('urban-echo', 'lost-signal', 'Lost Signal', 'relaxed-fit-sweatshirt', 'Cozy oversized charcoal crewneck sweatshirt with organic cotton fleece backing, drop-shoulder seams, and rib finish mockneck collar.', 899, 1499, NULL, 35, 'YARO-005', ARRAY['images/relaxed_fit_sweatshirt.png'], ARRAY['S','M','L','XL','XXL'], 'active', 'Urban Echo', 'Chapter', 'bestseller', 'A frequency cut short, a voice fading into static.', 'Flash Sale'),
  ('urban-echo', 'silent-crowd', 'Silent Crowd', 'oversized-drop-shoulder', 'Heavyweight sand beige drop-shoulder t-shirt with premium mock neck rib collar and structured boxy aesthetic outline.', 899, 1499, NULL, 35, 'YARO-006', ARRAY['images/oversized_drop_shoulder.png'], ARRAY['S','M','L','XL','XXL'], 'active', 'Urban Echo', 'New', 'new', 'Surrounded by thousands, yet walking in absolute silence.', 'Season Sale'),
  ('midnight-society', 'late-escape', 'Late Escape', 'mini-logo-tee', 'Classic kids white graphic t-shirt in extremely soft organic ring-spun combed cotton, featuring the YARO micro logo on the chest.', 899, 1299, NULL, 25, 'YARO-007', ARRAY['images/mini_logo_tee.png'], ARRAY['XS','S','M','L'], 'active', 'Midnight Society', 'New', 'new', 'Sneaking out into the cool night, leaving the city behind.', 'Clearance'),
  ('wander', 'lost-path', 'Lost Path', 'mini-hoodie', 'Ultra soft double fleece organic light beige kid hoodie. Minimalist clean style with micro branding and perfect warmth for children.', 899, 1399, NULL, 20, 'YARO-008', ARRAY['images/mini_hoodie.png'], ARRAY['XS','S','M','L'], 'active', 'Wander', 'New', 'new', 'Not all who wander are looking for a way home.', 'Clearance')
) AS p(collection_slug, story_slug, name, slug, description, price, original_price, sale_price, stock, sku, images, sizes, status, category, badge, badge_class, story_text, offer_name)
JOIN collections_map c ON c.slug = p.collection_slug
JOIN stories_map s ON s.slug = p.story_slug
ON CONFLICT (slug) DO NOTHING;
