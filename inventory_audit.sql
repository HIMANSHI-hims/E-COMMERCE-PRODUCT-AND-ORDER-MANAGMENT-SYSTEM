
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