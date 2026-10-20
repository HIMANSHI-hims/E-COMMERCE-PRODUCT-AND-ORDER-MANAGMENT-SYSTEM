
SELECT
    o.order_id,
    o.total_amount AS order_total,
    NVL(SUM(
        CASE
            WHEN p.payment_status = 'Completed'
            THEN p.amount
            ELSE 0
        END
    ), 0) AS completed_amount,
    o.total_amount - NVL(SUM(
        CASE
            WHEN p.payment_status = 'Completed'
            THEN p.amount
            ELSE 0
        END
    ), 0) AS balance,
    CASE
        WHEN NVL(SUM(
            CASE
                WHEN p.payment_status = 'Completed'
                THEN p.amount
                ELSE 0
            END
        ), 0) = 0
            THEN 'Unpaid'
        WHEN NVL(SUM(
            CASE
                WHEN p.payment_status = 'Completed'
                THEN p.amount
                ELSE 0
            END
        ), 0) < o.total_amount
            THEN 'Partially Paid'
        WHEN NVL(SUM(
            CASE
                WHEN p.payment_status = 'Completed'
                THEN p.amount
                ELSE 0
            END
        ), 0) = o.total_amount
            THEN 'Fully Paid'
        ELSE 'Overpaid'
    END AS payment_status_check
FROM ORDERS o
LEFT JOIN PAYMENTS p
    ON o.order_id = p.order_id
GROUP BY o.order_id, o.total_amount
ORDER BY o.order_id;
