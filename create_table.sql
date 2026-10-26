
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