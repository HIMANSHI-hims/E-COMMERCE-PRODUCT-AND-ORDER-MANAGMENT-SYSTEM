-- 1. Put stock back for orders placed through the website (IDs 1000 and up).
--    The sample orders never reduced stock, so they need no correction.
UPDATE PRODUCTS p
SET stock_quantity = stock_quantity + (
    SELECT NVL(SUM(oi.quantity), 0)
    FROM ORDER_ITEMS oi
    JOIN ORDERS o ON o.order_id = oi.order_id
    WHERE oi.product_id = p.product_id
      AND o.order_id >= 1000
      AND o.status <> 'Cancelled')
WHERE p.product_id IN (SELECT product_id FROM ORDER_ITEMS WHERE order_id >= 1000);

-- 2. Empty the transaction tables (children first because of foreign keys)
DELETE FROM PAYMENTS;
DELETE FROM ORDER_ITEMS;
DELETE FROM ORDERS;
DELETE FROM CUSTOMERS;
COMMIT;

-- 3. Customers: separate city and PIN code, and a sign-up date
ALTER TABLE CUSTOMERS ADD (
    city       VARCHAR2(50),
    pincode    VARCHAR2(6),
    created_at DATE DEFAULT SYSDATE NOT NULL
);
ALTER TABLE CUSTOMERS ADD CONSTRAINT chk_customer_pincode
    CHECK (pincode IS NULL OR REGEXP_LIKE(pincode, '^[0-9]{6}$'));

-- 4. Orders: delivery address and tracking dates
ALTER TABLE ORDERS ADD (
    shipping_address VARCHAR2(250),
    shipped_date     DATE,
    delivered_date   DATE
);

-- 5. Payments: when the payment was completed
ALTER TABLE PAYMENTS ADD (paid_date DATE);

-- 6. Products: admin can switch a product off (1 = available, 0 = unavailable)
ALTER TABLE PRODUCTS ADD (is_available NUMBER(1) DEFAULT 1 NOT NULL);
ALTER TABLE PRODUCTS ADD CONSTRAINT chk_product_available
    CHECK (is_available IN (0, 1));

-- 7. Restart the IDs of the cleared tables (products and categories keep theirs)
DROP SEQUENCE customers_seq;
DROP SEQUENCE orders_seq;
DROP SEQUENCE order_items_seq;
DROP SEQUENCE payments_seq;
CREATE SEQUENCE customers_seq   START WITH 1;
CREATE SEQUENCE orders_seq      START WITH 1001;
CREATE SEQUENCE order_items_seq START WITH 1;
CREATE SEQUENCE payments_seq    START WITH 1;

-- 8. Check the result
SELECT 'CUSTOMERS' AS table_name, COUNT(*) AS total FROM CUSTOMERS
UNION ALL SELECT 'ORDERS', COUNT(*) FROM ORDERS
UNION ALL SELECT 'ORDER_ITEMS', COUNT(*) FROM ORDER_ITEMS
UNION ALL SELECT 'PAYMENTS', COUNT(*) FROM PAYMENTS
UNION ALL SELECT 'CATEGORIES', COUNT(*) FROM CATEGORIES
UNION ALL SELECT 'PRODUCTS', COUNT(*) FROM PRODUCTS;