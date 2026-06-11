-- Update existing products with colours and colour_data based on their images
UPDATE products SET
  colours = '["Black"]'::jsonb,
  colour_data = jsonb_build_object('Black', to_jsonb(images))
WHERE colours IS NULL OR colours = '[]'::jsonb;
