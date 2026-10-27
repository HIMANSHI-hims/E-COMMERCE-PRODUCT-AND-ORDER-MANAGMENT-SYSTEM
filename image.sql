SELECT p.product_id, p.product_name, c.category_name, p.image_url
FROM products p LEFT JOIN categories c ON c.category_id = p.category_id
ORDER BY p.product_id;
-- one product
UPDATE products SET image_url = '<URL you have opened and confirmed>' WHERE product_id = 201;

-- category-level fallback for products that still have none
UPDATE products SET image_url = '<URL for that category>'
WHERE image_url IS NULL
  AND category_id = (SELECT category_id FROM categories WHERE category_name = 'Footwear');

COMMIT;