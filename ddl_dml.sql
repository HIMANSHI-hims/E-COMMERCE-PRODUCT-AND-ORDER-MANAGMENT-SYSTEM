
-- 1. ALTER: Add a brand column to PRODUCTS
ALTER TABLE PRODUCTS
ADD brand VARCHAR2(50);

-- 2. UPDATE: Set brands for existing products
UPDATE PRODUCTS
SET brand = 'Dell'
WHERE product_id = 201;

UPDATE PRODUCTS
SET brand = 'Sony'
WHERE product_id = 202;

UPDATE PRODUCTS
SET brand = 'Generic'
WHERE product_id IN (203, 204);

-- 3. INSERT: Add a new product
INSERT INTO PRODUCTS
(product_id, category_id, product_name, price, stock_quantity, brand)
VALUES
(205, 101, 'Keyboard', 1200, 20, 'Logitech');

-- 4. DELETE: Delete the product we just added
DELETE FROM PRODUCTS
WHERE product_id = 205;

-- 5. Verify the changes
SELECT * FROM PRODUCTS
ORDER BY product_id;

COMMIT;
