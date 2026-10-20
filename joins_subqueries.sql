SELECT
    o.order_id,
    c.customer_name,
    o.order_date,
    o.status,
    o.total_amount
FROM ORDERS o
JOIN CUSTOMERS c
    ON o.customer_id = c.customer_id
ORDER BY o.order_id;
SELECT
    p.product_id,
    p.product_name,
    c.category_name,
    p.price,
    p.stock_quantity,
    p.brand
FROM PRODUCTS p
JOIN CATEGORIES c
    ON p.category_id = c.category_id
ORDER BY c.category_name, p.product_name;
SELECT
    oi.order_id,
    p.product_name,
    oi.quantity,
    oi.unit_price,
    oi.quantity * oi.unit_price AS item_total
FROM ORDER_ITEMS oi
JOIN PRODUCTS p
    ON oi.product_id = p.product_id
ORDER BY oi.order_id;
SELECT
    o.order_id,
    c.customer_name,
    p.product_name,
    oi.quantity,
    oi.unit_price,
    oi.quantity * oi.unit_price AS item_total,
    o.status
FROM ORDERS o
JOIN CUSTOMERS c
    ON o.customer_id = c.customer_id
JOIN ORDER_ITEMS oi
    ON o.order_id = oi.order_id
JOIN PRODUCTS p
    ON oi.product_id = p.product_id
ORDER BY o.order_id;
SELECT product_name, price
FROM PRODUCTS
WHERE price > (
    SELECT AVG(price)
    FROM PRODUCTS
);
SELECT customer_id, customer_name
FROM CUSTOMERS
WHERE customer_id NOT IN (
    SELECT customer_id
    FROM ORDERS
);