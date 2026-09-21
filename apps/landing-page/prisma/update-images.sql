-- Update Red Onions
UPDATE farm_products
SET
  thumbnail = 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80', 'https://images.unsplash.com/photo-1587735243615-c03f25aaff56?w=800&q=80']
WHERE slug = 'red-onions';

-- Update Fresh Tilapia Fish
UPDATE farm_products
SET
  thumbnail = 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80']
WHERE slug = 'fresh-tilapia-fish';

-- Update Fresh Farm Eggs
UPDATE farm_products
SET
  thumbnail = 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&q=80', 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=800&q=80']
WHERE slug = 'fresh-farm-eggs';

-- Update Fresh Ginger
UPDATE farm_products
SET
  thumbnail = 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=800&q=80',
  images = ARRAY['https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=800&q=80', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80']
WHERE slug = 'fresh-ginger';

SELECT 'Images updated successfully!' as result;
