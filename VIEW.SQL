
CREATE OR REPLACE VIEW Order_History_View AS
SELECT
    o.order_id AS "Order ID",
    o.order_date AS "Date",
    LISTAGG(
        p.product_name || ' x ' || oi.quantity,
        ', '
    ) WITHIN GROUP (
        ORDER BY p.product_name
    ) AS "Products",
    o.total_amount AS "Total",
    o.status AS "Order status",
    pay.payment_status AS "Payment",
    'Payment ID: ' || pay.payment_id ||
    ' | Method: ' || pay.payment_method ||
    ' | Amount: ' || pay.amount AS "Details"
FROM Orders o
JOIN Order_Items oi
    ON o.order_id = oi.order_id
JOIN Products p
    ON oi.product_id = p.product_id
LEFT JOIN Payments pay
    ON o.order_id = pay.order_id
GROUP BY
    o.order_id,
    o.order_date,
    o.total_amount,
    o.status,
    pay.payment_id,
    pay.payment_status,
    pay.payment_method,
    pay.amount;
SELECT * FROM Order_History_View ORDER BY "Order ID" DESC;