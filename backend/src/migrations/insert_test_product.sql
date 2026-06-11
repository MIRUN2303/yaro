-- Insert a test product with colours and colour_data
INSERT INTO products (name, slug, description, price, original_price, stock, images, sizes, colours, colour_data, status, category, gender, badge, badge_class, collection_id)
SELECT
  'Obsidian Shadow Tee',
  'obsidian-shadow-tee-' || floor(extract(epoch from now()))::text,
  'A premium heavyweight black tee with structured fit and high-density print.',
  999,
  1499,
  50,
  ARRAY['images/detail_pics/center_model.png','images/detail_pics/left_back.png','images/detail_pics/right_front.png'],
  ARRAY['S','M','L','XL','XXL'],
  '["Black","White"]'::jsonb,
  '{"Black":["images/detail_pics/center_model.png","images/detail_pics/left_back.png"],"White":["images/detail_pics/right_front.png"]}'::jsonb,
  'active', 'Test Collection', 'Any', 'New', 'new',
  (SELECT id FROM collections LIMIT 1)
RETURNING id, name, slug, colours, colour_data;
