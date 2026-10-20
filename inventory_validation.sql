
SELECT
    p.product_id,
    p.product_name,
    p.stock_quantity,
    NVL(SUM(oi.quantity), 0) AS quantity_ordered,
    p.stock_quantity - NVL(SUM(oi.quantity), 0) AS remaining_stock
FROM PRODUCTS p
LEFT JOIN ORDER_ITEMS oi
    ON p.product_id = oi.product_id
GROUP BY
    p.product_id,
    p.product_name,
    p.stock_quantity
ORDER BY p.product_id;
