SELECT product_id, product_name, price
FROM Products
WHERE price > (
    SELECT AVG(price)
    FROM Products
)
ORDER BY price DESC;
SELECT product_id, product_name, price
FROM Products
WHERE price = (
    SELECT MAX(price)
    FROM Products
);
SELECT order_id, customer_id, total_amount
FROM Orders
WHERE total_amount > (
    SELECT AVG(total_amount)
    FROM Orders
)
ORDER BY total_amount DESC;
SELECT customer_id, customer_name, email
FROM Customers
WHERE customer_id IN (
    SELECT customer_id
    FROM Orders
);
SELECT product_id, product_name, category_id, price
FROM Products
WHERE category_id IN (
    SELECT category_id
    FROM Products
    WHERE price > (
        SELECT AVG(price)
        FROM Products
    )
);
SELECT c.customer_id, c.customer_name, c.email
FROM Customers c
WHERE NOT EXISTS (
    SELECT 1
    FROM Orders o
    WHERE o.customer_id = c.customer_id
);
SELECT p.product_id, p.product_name, p.stock_quantity
FROM Products p
WHERE NOT EXISTS (
    SELECT 1
    FROM Order_Items oi
    WHERE oi.product_id = p.product_id
);
SELECT c.customer_id, c.customer_name
FROM Customers c
WHERE EXISTS (
    SELECT 1
    FROM Orders o
    WHERE o.customer_id = c.customer_id
      AND o.total_amount > 10000
);
SELECT
    c.customer_id,
    c.customer_name,
    NVL(s.total_spent, 0) AS total_spent
FROM Customers c
LEFT JOIN (
    SELECT customer_id, SUM(total_amount) AS total_spent
    FROM Orders
    GROUP BY customer_id
) s
    ON c.customer_id = s.customer_id
ORDER BY total_spent DESC;
SELECT
    p.product_id,
    p.product_name,
    p.price,
    (SELECT AVG(price) FROM Products) AS average_price
FROM Products p
ORDER BY p.product_id;
SELECT p.product_id, p.product_name, p.category_id, p.price
FROM Products p
WHERE p.price > (
    SELECT AVG(p2.price)
    FROM Products p2
    WHERE p2.category_id = p.category_id
)
ORDER BY p.category_id, p.price DESC;