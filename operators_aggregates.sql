
-- 1. BETWEEN operator: Products within a price range
SELECT product_name, price
FROM PRODUCTS
WHERE price BETWEEN 500 AND 2000;

-- 2. IN operator: Products in selected categories
SELECT product_name, category_id
FROM PRODUCTS
WHERE category_id IN (101, 103);

-- 3. LIKE operator: Products whose names start with 'L'
SELECT product_name
FROM PRODUCTS
WHERE product_name LIKE 'L%';

-- 4. AND operator: Products that are affordable and in stock
SELECT product_name, price, stock_quantity
FROM PRODUCTS
WHERE price < 2000 AND stock_quantity > 0;

-- 5. OR operator: Orders that are Pending or Shipped
SELECT order_id, status
FROM ORDERS
WHERE status = 'Pending' OR status = 'Shipped';

-- 6. COUNT: Total number of products
SELECT COUNT(*) AS total_products
FROM PRODUCTS;

-- 7. SUM: Total stock quantity
SELECT SUM(stock_quantity) AS total_stock
FROM PRODUCTS;

-- 8. AVG: Average product price
SELECT AVG(price) AS average_price
FROM PRODUCTS;

-- 9. MIN and MAX: Cheapest and costliest product prices
SELECT MIN(price) AS minimum_price,
       MAX(price) AS maximum_price
FROM PRODUCTS;

-- 10. GROUP BY: Number of products in each category
SELECT category_id, COUNT(*) AS product_count
FROM PRODUCTS
GROUP BY category_id;

-- 11. HAVING: Categories with more than one product
SELECT category_id, COUNT(*) AS product_count
FROM PRODUCTS
GROUP BY category_id
HAVING COUNT(*) > 1;

-- 12. ORDER BY: Sort products from highest to lowest price
SELECT product_name, price
FROM PRODUCTS
ORDER BY price DESC;
