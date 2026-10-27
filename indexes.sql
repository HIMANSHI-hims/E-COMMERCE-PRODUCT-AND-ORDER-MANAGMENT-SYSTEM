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