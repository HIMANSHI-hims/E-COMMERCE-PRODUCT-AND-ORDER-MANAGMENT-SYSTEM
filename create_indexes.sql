CREATE INDEX idx_orders_customer
ON Orders(customer_id);

CREATE INDEX idx_order_items_order
ON Order_Items(order_id);

CREATE INDEX idx_order_items_product
ON Order_Items(product_id);

CREATE INDEX idx_payments_order
ON Payments(order_id);

CREATE INDEX idx_products_category
ON Products(category_id);

CREATE INDEX idx_audit_product
ON Inventory_Audit(product_id);
CREATE INDEX idx_products_category
ON Products(category_id);
SELECT index_name, table_name, status
FROM user_indexes
WHERE index_name IN (
    'IDX_ORDERS_CUSTOMER',
    'IDX_ORDER_ITEMS_ORDER',
    'IDX_ORDER_ITEMS_PRODUCT',
    'IDX_PAYMENTS_ORDER',
    'IDX_PRODUCTS_CATEGORY',
    'IDX_AUDIT_PRODUCT'
)
ORDER BY index_name;