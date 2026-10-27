
-- 1. UPPER: Convert product names to uppercase
SELECT product_id, UPPER(product_name) AS uppercase_name
FROM PRODUCTS;

-- 2. LOWER: Convert customer names to lowercase
SELECT customer_name, LOWER(customer_name) AS lowercase_name
FROM CUSTOMERS;

-- 3. INITCAP: Capitalize the first letter of each word
SELECT INITCAP(customer_name) AS formatted_name
FROM CUSTOMERS;

-- 4. ROUND: Round product prices
SELECT product_name, price, ROUND(price) AS rounded_price
FROM PRODUCTS;

-- 5. NVL: Replace NULL brand values
SELECT product_name, NVL(brand, 'Unknown') AS brand_name
FROM PRODUCTS;

-- 6. TO_CHAR: Format order dates
SELECT order_id, TO_CHAR(order_date, 'DD-MON-YYYY') AS formatted_date
FROM ORDERS;

-- 7. LENGTH: Count characters in product names
SELECT product_name, LENGTH(product_name) AS name_length
FROM PRODUCTS;

-- 8. SUBSTR: Display the first three characters
SELECT product_name, SUBSTR(product_name, 1, 3) AS short_name
FROM PRODUCTS;
SELECT o.order_id,
       o.total_amount,
       ROUND(o.total_amount)                      AS payable_amount,
       ROUND(o.total_amount) - o.total_amount     AS rounding_adjustment,
       p.method,
       p.status
FROM   ORDERS o
JOIN   PAYMENTS p ON p.order_id = o.order_id
WHERE  o.order_id = :order_id;