-- YARO RLS Policies
-- Run this in Supabase SQL Editor after 001_initial.sql

-- 1. COLLECTIONS
DROP POLICY IF EXISTS "Public read collections" ON collections;
CREATE POLICY "Public read collections" ON collections
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin insert collections" ON collections;
CREATE POLICY "Admin insert collections" ON collections
  FOR INSERT WITH CHECK (auth.email() = 'yarodrops@gmail.com');

DROP POLICY IF EXISTS "Admin update collections" ON collections;
CREATE POLICY "Admin update collections" ON collections
  FOR UPDATE USING (auth.email() = 'yarodrops@gmail.com');

DROP POLICY IF EXISTS "Admin delete collections" ON collections;
CREATE POLICY "Admin delete collections" ON collections
  FOR DELETE USING (auth.email() = 'yarodrops@gmail.com');

-- 2. STORIES
DROP POLICY IF EXISTS "Public read stories" ON stories;
CREATE POLICY "Public read stories" ON stories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin insert stories" ON stories;
CREATE POLICY "Admin insert stories" ON stories
  FOR INSERT WITH CHECK (auth.email() = 'yarodrops@gmail.com');

DROP POLICY IF EXISTS "Admin update stories" ON stories;
CREATE POLICY "Admin update stories" ON stories
  FOR UPDATE USING (auth.email() = 'yarodrops@gmail.com');

DROP POLICY IF EXISTS "Admin delete stories" ON stories;
CREATE POLICY "Admin delete stories" ON stories
  FOR DELETE USING (auth.email() = 'yarodrops@gmail.com');

-- 3. PRODUCTS
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin insert products" ON products;
CREATE POLICY "Admin insert products" ON products
  FOR INSERT WITH CHECK (auth.email() = 'yarodrops@gmail.com');

DROP POLICY IF EXISTS "Admin update products" ON products;
CREATE POLICY "Admin update products" ON products
  FOR UPDATE USING (auth.email() = 'yarodrops@gmail.com');

DROP POLICY IF EXISTS "Admin delete products" ON products;
CREATE POLICY "Admin delete products" ON products
  FOR DELETE USING (auth.email() = 'yarodrops@gmail.com');

-- 4. ORDERS (admin read + admin update)
DROP POLICY IF EXISTS "Admin read orders" ON orders;
CREATE POLICY "Admin read orders" ON orders
  FOR SELECT USING (auth.email() = 'yarodrops@gmail.com');

DROP POLICY IF EXISTS "Admin update orders" ON orders;
CREATE POLICY "Admin update orders" ON orders
  FOR UPDATE USING (auth.email() = 'yarodrops@gmail.com');

DROP POLICY IF EXISTS "Admin insert orders" ON orders;
CREATE POLICY "Admin insert orders" ON orders
  FOR INSERT WITH CHECK (auth.email() = 'yarodrops@gmail.com');

DROP POLICY IF EXISTS "Admin delete orders" ON orders;
CREATE POLICY "Admin delete orders" ON orders
  FOR DELETE USING (auth.email() = 'yarodrops@gmail.com');

-- 5. ORDER ITEMS (admin read + admin write)
DROP POLICY IF EXISTS "Admin read order_items" ON order_items;
CREATE POLICY "Admin read order_items" ON order_items
  FOR SELECT USING (auth.email() = 'yarodrops@gmail.com');

DROP POLICY IF EXISTS "Admin insert order_items" ON order_items;
CREATE POLICY "Admin insert order_items" ON order_items
  FOR INSERT WITH CHECK (auth.email() = 'yarodrops@gmail.com');

DROP POLICY IF EXISTS "Admin delete order_items" ON order_items;
CREATE POLICY "Admin delete order_items" ON order_items
  FOR DELETE USING (auth.email() = 'yarodrops@gmail.com');

-- 6. CART ITEMS (admin read + admin write)
DROP POLICY IF EXISTS "Admin read cart_items" ON cart_items;
CREATE POLICY "Admin read cart_items" ON cart_items
  FOR SELECT USING (auth.email() = 'yarodrops@gmail.com');

DROP POLICY IF EXISTS "Admin insert cart_items" ON cart_items;
CREATE POLICY "Admin insert cart_items" ON cart_items
  FOR INSERT WITH CHECK (auth.email() = 'yarodrops@gmail.com');

DROP POLICY IF EXISTS "Admin delete cart_items" ON cart_items;
CREATE POLICY "Admin delete cart_items" ON cart_items
  FOR DELETE USING (auth.email() = 'yarodrops@gmail.com');
