
-- ==================== create_table.sql ====================


CREATE TABLE Customers (
    customer_id NUMBER(5) PRIMARY KEY,
    customer_name VARCHAR2(100) NOT NULL,
    email VARCHAR2(100) UNIQUE NOT NULL,
    phone VARCHAR2(15),
    address VARCHAR2(200)
);
CREATE TABLE Categories (
    category_id NUMBER(5) PRIMARY KEY,
    category_name VARCHAR2(50) UNIQUE NOT NULL,
    description VARCHAR2(200)
);

CREATE TABLE Products (
    product_id NUMBER(5) PRIMARY KEY,
    category_id NUMBER(5),
    product_name VARCHAR2(100) NOT NULL,
    price NUMBER(10,2) NOT NULL CHECK (price > 0),
    stock_quantity NUMBER(6) DEFAULT 0 NOT NULL
        CHECK (stock_quantity >= 0),
    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id)
        REFERENCES Categories(category_id)
);
CREATE TABLE Orders (
    order_id NUMBER(5) PRIMARY KEY,
    customer_id NUMBER(5) NOT NULL,
    order_date DATE DEFAULT SYSDATE NOT NULL,
    status VARCHAR2(20) DEFAULT 'Pending' NOT NULL
        CHECK (status IN ('Pending', 'Shipped', 'Delivered', 'Cancelled')),
    total_amount NUMBER(10,2) DEFAULT 0 NOT NULL
        CHECK (total_amount >= 0),
    CONSTRAINT fk_order_customer
        FOREIGN KEY (customer_id)
        REFERENCES Customers(customer_id)
);
CREATE TABLE Order_Items (
    order_item_id NUMBER(5) PRIMARY KEY,
    order_id NUMBER(5) NOT NULL,
    product_id NUMBER(5) NOT NULL,
    quantity NUMBER(5) NOT NULL CHECK (quantity > 0),
    unit_price NUMBER(10,2) NOT NULL CHECK (unit_price > 0),
    CONSTRAINT fk_item_order
        FOREIGN KEY (order_id)
        REFERENCES Orders(order_id),
    CONSTRAINT fk_item_product
        FOREIGN KEY (product_id)
        REFERENCES Products(product_id)
);
CREATE TABLE Payments (
    payment_id NUMBER(5) PRIMARY KEY,
    order_id NUMBER(5) NOT NULL,
    payment_date DATE DEFAULT SYSDATE NOT NULL,
    amount NUMBER(10,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR2(20) NOT NULL
        CHECK (payment_method IN ('UPI', 'Card', 'Net Banking', 'Cash')),
    payment_status VARCHAR2(20) DEFAULT 'Pending' NOT NULL
        CHECK (payment_status IN ('Pending', 'Completed', 'Failed')),
    CONSTRAINT fk_payment_order
        FOREIGN KEY (order_id)
        REFERENCES Orders(order_id)
);
SELECT TABLE_NAME
FROM USER_TABLES
WHERE TABLE_NAME IN (
    'CUSTOMERS',
    'CATEGORIES',
    'PRODUCTS',
    'ORDERS',
    'ORDER_ITEMS',
    'PAYMENTS'
)
ORDER BY TABLE_NAME;
ALTER TABLE Customers
ADD password_hash VARCHAR2(255);
ALTER TABLE CUSTOMERS ADD (
    failed_attempts NUMBER(2) DEFAULT 0 NOT NULL,
    locked_until    TIMESTAMP,
    last_login      TIMESTAMP
);
-- Step 1: Add customer_id and customer_name columns
ALTER TABLE Order_Items
ADD (
    customer_id NUMBER(5),
    customer_name VARCHAR2(100)
);

-- Step 2: Populate customer details from Orders and Customers
UPDATE Order_Items oi
SET (customer_id, customer_name) = (
    SELECT o.customer_id, c.customer_name
    FROM Orders o
    JOIN Customers c
        ON o.customer_id = c.customer_id
    WHERE o.order_id = oi.order_id
);

-- Step 3: Save the changes
COMMIT;

-- Step 4: Display the complete table
SELECT *
FROM Order_Items
ORDER BY order_item_id;
ALTER TABLE Orders
ADD customer_name VARCHAR2(100);

UPDATE Orders o
SET customer_name = (
    SELECT c.customer_name
    FROM Customers c
    WHERE c.customer_id = o.customer_id
);

COMMIT;

-- ==================== ALTER.sql ====================

SELECT USER FROM dual;
SELECT sys_context('USERENV', 'SERVICE_NAME') AS service FROM dual;
SELECT column_name FROM user_tab_columns WHERE table_name = 'PRODUCTS';
ALTER TABLE PRODUCTS ADD (image_url VARCHAR2(500));

-- ==================== image.sql ====================

SELECT p.product_id, p.product_name, c.category_name, p.image_url
FROM products p LEFT JOIN categories c ON c.category_id = p.category_id
ORDER BY p.product_id;
-- one product
UPDATE products SET image_url = '<URL you have opened and confirmed>' WHERE product_id = 201;

-- category-level fallback for products that still have none
UPDATE products SET image_url = '<URL for that category>'
WHERE image_url IS NULL
  AND category_id = (SELECT category_id FROM categories WHERE category_name = 'Footwear');

COMMIT;

-- ==================== admins.sql ====================

CREATE TABLE ADMINS (
    admin_id        NUMBER(5) PRIMARY KEY,
    username        VARCHAR2(50) UNIQUE NOT NULL,
    password_hash   VARCHAR2(200) NOT NULL,
    full_name       VARCHAR2(100),
    is_active       NUMBER(1) DEFAULT 1 NOT NULL CHECK (is_active IN (0, 1)),
    failed_attempts NUMBER(2) DEFAULT 0 NOT NULL,
    locked_until    TIMESTAMP,
    last_login      TIMESTAMP,
    created_at      DATE DEFAULT SYSDATE NOT NULL
);
CREATE SEQUENCE admins_seq START WITH 1;
SELECT USER FROM dual;
SELECT owner, table_name FROM all_tables WHERE table_name = 'ADMINS';

-- ==================== insert_data.sql ====================


-- 1. CUSTOMERS
INSERT INTO CUSTOMERS VALUES
(1, 'Aarav Sharma', 'aarav@example.com', '9000000001', 'Chennai');

INSERT INTO CUSTOMERS VALUES
(2, 'Priya Verma', 'priya@example.com', '9000000002', 'Vellore');

INSERT INTO CUSTOMERS VALUES
(3, 'Rahul Mehta', 'rahul@example.com', '9000000003', 'Bangalore');

INSERT INTO CUSTOMERS VALUES
(4, 'Himanshi Srivastava', 'himanshi@example.com', '9000000004', 'Vellore');

INSERT INTO CUSTOMERS VALUES
(5, 'Avantika Pratyush', 'avantika@example.com', '9000000005', 'Vellore');


-- 2. CATEGORIES
INSERT INTO CATEGORIES VALUES
(101, 'Electronics', 'Electronic devices and accessories');

INSERT INTO CATEGORIES VALUES
(102, 'Clothing', 'Fashion and apparel');

INSERT INTO CATEGORIES VALUES
(103, 'Books', 'Books and educational materials');


-- 3. PRODUCTS
INSERT INTO PRODUCTS VALUES
(201, 101, 'Laptop', 55000, 10);

INSERT INTO PRODUCTS VALUES
(202, 101, 'Headphones', 1500, 25);

INSERT INTO PRODUCTS VALUES
(203, 102, 'T-Shirt', 799, 40);

INSERT INTO PRODUCTS VALUES
(204, 103, 'DBMS Textbook', 650, 15);


-- 4. ORDERS
INSERT INTO ORDERS VALUES
(301, 1, DATE '2026-10-01', 'Delivered', 56500);

INSERT INTO ORDERS VALUES
(302, 2, DATE '2026-10-03', 'Pending', 799);

INSERT INTO ORDERS VALUES
(303, 3, DATE '2026-10-05', 'Shipped', 650);

INSERT INTO ORDERS VALUES
(304, 4, DATE '2026-10-10', 'Delivered', 1500);

INSERT INTO ORDERS VALUES
(305, 5, DATE '2026-10-11', 'Pending', 650);


-- 5. ORDER_ITEMS
INSERT INTO ORDER_ITEMS VALUES
(401, 301, 201, 1, 55000);

INSERT INTO ORDER_ITEMS VALUES
(402, 301, 202, 1, 1500);

INSERT INTO ORDER_ITEMS VALUES
(403, 302, 203, 1, 799);

INSERT INTO ORDER_ITEMS VALUES
(404, 303, 204, 1, 650);

INSERT INTO ORDER_ITEMS VALUES
(405, 304, 202, 1, 1500);

INSERT INTO ORDER_ITEMS VALUES
(406, 305, 204, 1, 650);


-- 6. PAYMENTS
INSERT INTO PAYMENTS VALUES
(501, 301, DATE '2026-10-01', 56500, 'UPI', 'Completed');

INSERT INTO PAYMENTS VALUES
(502, 302, DATE '2026-10-03', 799, 'Card', 'Pending');

INSERT INTO PAYMENTS VALUES
(503, 303, DATE '2026-10-05', 650, 'Net Banking', 'Completed');

INSERT INTO PAYMENTS VALUES
(504, 304, DATE '2026-10-10', 1500, 'UPI', 'Completed');

INSERT INTO PAYMENTS VALUES
(505, 305, DATE '2026-10-11', 650, 'Card', 'Pending');

COMMIT;
SELECT * FROM CUSTOMERS ORDER BY CUSTOMER_ID;
SELECT 'CUSTOMERS' AS TABLE_NAME, COUNT(*) AS TOTAL FROM CUSTOMERS
UNION ALL
SELECT 'CATEGORIES', COUNT(*) FROM CATEGORIES
UNION ALL
SELECT 'PRODUCTS', COUNT(*) FROM PRODUCTS
UNION ALL
SELECT 'ORDERS', COUNT(*) FROM ORDERS
UNION ALL
SELECT 'ORDER_ITEMS', COUNT(*) FROM ORDER_ITEMS
UNION ALL
SELECT 'PAYMENTS', COUNT(*) FROM PAYMENTS;

-- ==================== ddl_dml.sql ====================


-- 1. ALTER: Add a brand column to PRODUCTS
ALTER TABLE PRODUCTS
ADD brand VARCHAR2(50);

-- 2. UPDATE: Set brands for existing products
UPDATE PRODUCTS
SET brand = 'Dell'
WHERE product_id = 201;

UPDATE PRODUCTS
SET brand = 'Sony'
WHERE product_id = 202;

UPDATE PRODUCTS
SET brand = 'Generic'
WHERE product_id IN (203, 204);

-- 3. INSERT: Add a new product
INSERT INTO PRODUCTS
(product_id, category_id, product_name, price, stock_quantity, brand)
VALUES
(205, 101, 'Keyboard', 1200, 20, 'Logitech');

-- 4. DELETE: Delete the product we just added
DELETE FROM PRODUCTS
WHERE product_id = 205;

-- 5. Verify the changes
SELECT * FROM PRODUCTS
ORDER BY product_id;

COMMIT;


-- ==================== indexes.sql ====================

-- ELVORA: Database Index Optimization

-- Indexes already created successfully:
-- idx_orders_customer
-- idx_order_items_order
-- idx_order_items_product
-- idx_payments_order

-- Remaining optional indexes:
CREATE INDEX idx_products_category
ON Products(category_id);

CREATE INDEX idx_audit_product
ON Inventory_Audit(product_id);

-- Verify all indexes
SELECT
    table_name,
    index_name,
    status
FROM user_indexes
WHERE table_name IN (
    'PRODUCTS',
    'INVENTORY_AUDIT',
    'ORDERS',
    'ORDER_ITEMS',
    'PAYMENTS'
)
ORDER BY table_name, index_name;

-- ==================== VIEW.SQL ====================


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

-- ==================== view_data.sql ====================

SELECT * FROM CUSTOMERS;
SELECT DBMS_METADATA.GET_DDL('TABLE','PAYMENTS') FROM dual;
SELECT * FROM PRODUCTS WHERE PRODUCT_ID=1000;
SELECT * FROM ORDERS;
SELECT * FROM CUSTOMERS;
SELECT * FROM ORDER_ITEMS;
SELECT * FROM ORDERS;
SELECT * FROM CATEGORIES;
SELECT product_id, product_name, category_id
FROM Products
ORDER BY product_id;

-- ==================== functions.sql ====================


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

-- ==================== operators_aggregates.sql ====================


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


-- ==================== joins_subqueries.sql ====================

--query1
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
--query2
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
--query3
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
--query4
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
--query5
SELECT product_name, price
FROM PRODUCTS
WHERE price > (
    SELECT AVG(price)
    FROM PRODUCTS
);
--query6
SELECT customer_id, customer_name
FROM CUSTOMERS
WHERE customer_id NOT IN (
    SELECT customer_id
    FROM ORDERS
);

-- ==================== SUBQUEIRES.sql ====================

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


-- ==================== customer_order_details.sql ====================


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


-- ==================== inventory_validation.sql ====================


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


-- ==================== order_validation.sql ====================

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

-- ==================== payment_validation.sql ====================


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


-- ==================== payment_trigger.sql ====================

CREATE OR REPLACE TRIGGER trg_order_status_needs_payment
BEFORE UPDATE OF status ON orders
FOR EACH ROW
WHEN (NEW.status <> OLD.status AND NEW.status <> 'Pending')
DECLARE
    v_unpaid NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_unpaid
    FROM payments p
    WHERE p.order_id = :NEW.order_id
      AND p.payment_method <> 'Cash'
      AND p.payment_status <> 'Completed';

    IF v_unpaid > 0 THEN
        RAISE_APPLICATION_ERROR(-20010,
            'Order status can be changed only after payment is completed (not needed for Cash on Delivery).');
    END IF;
END;
/
UPDATE payments SET payment_status = 'Completed', payment_date = SYSDATE
WHERE order_id = 1001;
COMMIT;

-- ==================== inventory_audit.sql ====================


CREATE TABLE Inventory_Audit (
    audit_id NUMBER GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    product_id NUMBER(5) NOT NULL,

    old_stock NUMBER(10) NOT NULL,
    new_stock NUMBER(10) NOT NULL,

    change_reason VARCHAR2(100),

    change_date TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

    CONSTRAINT fk_audit_product
        FOREIGN KEY (product_id)
        REFERENCES Products(product_id),

    CONSTRAINT chk_audit_old_stock
        CHECK (old_stock >= 0),

    CONSTRAINT chk_audit_new_stock
        CHECK (new_stock >= 0)
);

CREATE OR REPLACE TRIGGER trg_inventory_audit
AFTER UPDATE OF stock_quantity ON Products
FOR EACH ROW
WHEN (OLD.stock_quantity <> NEW.stock_quantity)
BEGIN
    INSERT INTO Inventory_Audit (
        product_id,
        old_stock,
        new_stock,
        change_reason
    )
    VALUES (
        :OLD.product_id,
        :OLD.stock_quantity,
        :NEW.stock_quantity,
        'Stock quantity updated'
    );
END;
/
SELECT trigger_name, status
FROM user_triggers
WHERE trigger_name = 'TRG_INVENTORY_AUDIT';
SELECT product_id, product_name, stock_quantity
FROM Products;
UPDATE Products
SET stock_quantity = stock_quantity + 1
WHERE product_id = 1000;

SELECT *
FROM Inventory_Audit
ORDER BY audit_id DESC;
