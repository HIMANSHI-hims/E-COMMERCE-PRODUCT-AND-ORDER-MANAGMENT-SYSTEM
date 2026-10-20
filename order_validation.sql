SELECT
    o.order_id,
    o.total_amount AS stored_total,
    NVL(SUM(oi.quantity * oi.unit_price), 0) AS calculated_total,
    o.total_amount - NVL(SUM(oi.quantity * oi.unit_price), 0)
        AS difference
FROM ORDERS o
LEFT JOIN ORDER_ITEMS oi
    ON o.order_id = oi.order_id
GROUP BY o.order_id, o.total_amount
ORDER BY o.order_id;