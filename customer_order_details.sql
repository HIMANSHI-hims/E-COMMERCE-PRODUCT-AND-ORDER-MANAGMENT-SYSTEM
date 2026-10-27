
SELECT
    c.customer_id,
    c.customer_name,
    oi.order_id,
    oi.order_item_id,
    p.product_name,
    oi.quantity,
    oi.unit_price,
    oi.quantity * oi.unit_price AS item_total
FROM Order_Items oi
JOIN Orders o
    ON oi.order_id = o.order_id
JOIN Customers c
    ON o.customer_id = c.customer_id
JOIN Products p
    ON oi.product_id = p.product_id
ORDER BY oi.order_id, oi.order_item_id;
