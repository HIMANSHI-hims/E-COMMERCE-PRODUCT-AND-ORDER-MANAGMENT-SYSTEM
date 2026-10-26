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