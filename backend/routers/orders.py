import oracledb
from fastapi import APIRouter, Depends, HTTPException
from auth import require_admin, require_customer
from db import get_conn, fetch_all
from schemas import OrderIn, StatusIn

router = APIRouter(tags=["orders"])

ORDER_STATUSES = ("Pending", "Shipped", "Delivered", "Cancelled")
PAYMENT_STATUSES = ("Pending", "Completed", "Failed")
COD = "Cash"

# CHANGE 2: total is rounded to the nearest rupee using Oracle's ROUND
ORDERS_SQL = """
    SELECT o.order_id, TO_CHAR(o.order_date, 'YYYY-MM-DD') AS order_date,
           c.customer_name AS customer, ROUND(o.total_amount) AS total,
           INITCAP(o.status) AS status, pay.payment_method AS payment,
           pay.payment_status AS payment_status
    FROM orders o
    JOIN customers c ON c.customer_id = o.customer_id
    LEFT JOIN payments pay ON pay.order_id = o.order_id
"""

ITEMS_SQL = """
    SELECT oi.order_id, oi.product_id AS "productId", pr.product_name AS name,
           oi.quantity AS qty, oi.unit_price AS price
    FROM order_items oi
    JOIN products pr ON pr.product_id = oi.product_id
"""


def parse_order_id(ref: str) -> int:
    try:
        return int(ref.replace("ORD-", ""))
    except ValueError:
        raise HTTPException(400, "Invalid order id.")


def build_orders(conn, where="", params=None):
    orders = fetch_all(
        conn,
        ORDERS_SQL + where + " ORDER BY o.order_id DESC",
        params,
    )

    items_sql = ITEMS_SQL

    if where:
        items_sql += (
            " WHERE oi.order_id IN "
            "(SELECT o.order_id FROM orders o " + where + ")"
        )

    by_order = {}

    for item in fetch_all(conn, items_sql, params):
        by_order.setdefault(item.pop("order_id"), []).append(item)

    return [
        {
            "id": f"ORD-{order['order_id']}",
            "date": order["order_date"],
            "customer": order["customer"],
            "total": order["total"],
            "status": order["status"],
            "payment": order["payment"] or "",
            "paymentStatus": order["payment_status"] or "",
            "items": by_order.get(order["order_id"], []),
        }
        for order in orders
    ]


@router.get("/orders", dependencies=[Depends(require_admin)])
def list_all_orders(conn=Depends(get_conn)):
    return build_orders(conn)


@router.get("/orders/mine")
def list_my_orders(
    claims=Depends(require_customer),
    conn=Depends(get_conn),
):
    return build_orders(
        conn,
        "WHERE o.customer_id = :cid",
        {"cid": int(claims["sub"])},
    )


@router.post("/orders", status_code=201)
def create_order(
    order: OrderIn,
    claims=Depends(require_customer),
    conn=Depends(get_conn),
):
    customer_id = int(claims["sub"])

    try:
        with conn.cursor() as cur:
            lines = []
            total = 0

            for item in sorted(order.items, key=lambda i: i.productId):
                cur.execute(
                    """
                    SELECT stock_quantity, price, product_name
                    FROM products
                    WHERE product_id = :id
                    FOR UPDATE
                    """,
                    {"id": item.productId},
                )

                product = cur.fetchone()

                if not product:
                    raise HTTPException(
                        404,
                        f"Product {item.productId} does not exist.",
                    )

                stock, price, product_name = product

                if item.qty > stock:
                    raise HTTPException(
                        409,
                        f"Only {stock} of '{product_name}' left in stock.",
                    )

                lines.append((item.productId, item.qty, price))
                total += price * item.qty

            # CHANGE 1: round the order total to the nearest rupee
            # using Oracle SQL (was ROUND(:total, 2)).
            cur.execute(
                "SELECT ROUND(:total) FROM dual",
                {"total": total},
            )
            total = cur.fetchone()[0]

            order_id_var = cur.var(int)

            cur.execute(
                """
                INSERT INTO orders (
                    order_id,
                    customer_id,
                    total_amount
                )
                VALUES (
                    orders_seq.NEXTVAL,
                    :customer_id,
                    :total
                )
                RETURNING order_id INTO :order_id
                """,
                {
                    "customer_id": customer_id,
                    "total": total,
                    "order_id": order_id_var,
                },
            )

            order_id = order_id_var.getvalue()[0]

            for product_id, quantity, price in lines:
                cur.execute(
                    """
                    INSERT INTO order_items (
                        order_item_id,
                        order_id,
                        product_id,
                        quantity,
                        unit_price
                    )
                    VALUES (
                        order_items_seq.NEXTVAL,
                        :order_id,
                        :product_id,
                        :quantity,
                        :price
                    )
                    """,
                    {
                        "order_id": order_id,
                        "product_id": product_id,
                        "quantity": quantity,
                        "price": price,
                    },
                )

                cur.execute(
                    """
                    UPDATE products
                    SET stock_quantity = stock_quantity - :quantity
                    WHERE product_id = :product_id
                    """,
                    {
                        "quantity": quantity,
                        "product_id": product_id,
                    },
                )

            cur.execute(
                """
                INSERT INTO payments (
                    payment_id,
                    order_id,
                    amount,
                    payment_method
                )
                VALUES (
                    payments_seq.NEXTVAL,
                    :order_id,
                    :amount,
                    :method
                )
                """,
                {
                    "order_id": order_id,
                    "amount": total,
                    "method": order.payment,
                },
            )

        conn.commit()

    except HTTPException:
        conn.rollback()
        raise

    except oracledb.DatabaseError as error:
        conn.rollback()
        raise HTTPException(
            400,
            f"Could not place order: {error}",
        )

    return {
        "orderId": f"ORD-{order_id}",
        "total": total,
    }


@router.post("/orders/{order_ref}/pay")
def pay_for_order(
    order_ref: str,
    claims=Depends(require_customer),
    conn=Depends(get_conn),
):
    order_id = parse_order_id(order_ref)

    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT o.status, pay.payment_method, pay.payment_status
                FROM orders o
                JOIN payments pay ON pay.order_id = o.order_id
                WHERE o.order_id = :order_id
                  AND o.customer_id = :customer_id
                FOR UPDATE
                """,
                {
                    "order_id": order_id,
                    "customer_id": int(claims["sub"]),
                },
            )

            row = cur.fetchone()

            if not row:
                raise HTTPException(404, "Order not found.")

            status, method, payment_status = row

            if status == "Cancelled":
                raise HTTPException(
                    409,
                    "This order was cancelled, so it can't be paid.",
                )

            if method == COD:
                raise HTTPException(
                    409,
                    "Cash on Delivery orders are paid when the order is delivered.",
                )

            if payment_status != "Completed":
                cur.execute(
                    """
                    UPDATE payments
                    SET payment_status = 'Completed',
                        payment_date = SYSDATE
                    WHERE order_id = :order_id
                    """,
                    {"order_id": order_id},
                )

        conn.commit()

    except HTTPException:
        conn.rollback()
        raise

    except oracledb.DatabaseError as error:
        conn.rollback()
        raise HTTPException(
            400,
            f"Could not complete payment: {error}",
        )

    return {
        "id": f"ORD-{order_id}",
        "paymentStatus": "Completed",
    }


@router.patch(
    "/orders/{order_ref}/status",
    dependencies=[Depends(require_admin)],
)
def update_order_status(
    order_ref: str,
    body: StatusIn,
    conn=Depends(get_conn),
):
    order_id = parse_order_id(order_ref)
    new_status = body.status

    if new_status not in ORDER_STATUSES:
        raise HTTPException(
            400,
            f"Status must be one of: {', '.join(ORDER_STATUSES)}.",
        )

    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT status FROM orders WHERE order_id = :id FOR UPDATE",
                {"id": order_id},
            )

            row = cur.fetchone()

            if not row:
                raise HTTPException(404, "Order not found.")

            old_status = row[0]

            if old_status == new_status:
                return {
                    "id": f"ORD-{order_id}",
                    "status": new_status,
                }

            cur.execute(
                """
                SELECT payment_method, payment_status
                FROM payments
                WHERE order_id = :id
                """,
                {"id": order_id},
            )

            payment = cur.fetchone()

            if (
                payment
                and payment[0] != COD
                and payment[1] != "Completed"
            ):
                raise HTTPException(
                    409,
                    "Payment is not completed yet. The status of this order can be changed only after the customer pays.",
                )

            if old_status == "Cancelled":
                raise HTTPException(
                    409,
                    "A cancelled order can't be reopened.",
                )

            if old_status == "Delivered" and new_status == "Cancelled":
                raise HTTPException(
                    409,
                    "A delivered order can't be cancelled.",
                )

            cur.execute(
                """
                UPDATE orders
                SET status = :status
                WHERE order_id = :id
                """,
                {"status": new_status, "id": order_id},
            )

            if new_status == "Cancelled":
                cur.execute(
                    """
                    UPDATE products p
                    SET stock_quantity = stock_quantity + (
                        SELECT NVL(SUM(oi.quantity), 0)
                        FROM order_items oi
                        WHERE oi.order_id = :id
                          AND oi.product_id = p.product_id
                    )
                    WHERE p.product_id IN (
                        SELECT product_id
                        FROM order_items
                        WHERE order_id = :id
                    )
                    """,
                    {"id": order_id},
                )

                cur.execute(
                    """
                    UPDATE payments
                    SET payment_status = 'Failed'
                    WHERE order_id = :id
                      AND payment_status = 'Pending'
                    """,
                    {"id": order_id},
                )

        conn.commit()

    except HTTPException:
        conn.rollback()
        raise

    except oracledb.DatabaseError as error:
        conn.rollback()
        raise HTTPException(
            400,
            f"Could not update order: {error}",
        )

    return {
        "id": f"ORD-{order_id}",
        "status": new_status,
    }


@router.patch(
    "/orders/{order_ref}/payment",
    dependencies=[Depends(require_admin)],
)
def update_payment_status(
    order_ref: str,
    body: StatusIn,
    conn=Depends(get_conn),
):
    order_id = parse_order_id(order_ref)

    if body.status not in PAYMENT_STATUSES:
        raise HTTPException(
            400,
            f"Payment status must be one of: {', '.join(PAYMENT_STATUSES)}.",
        )

    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT payment_method
                FROM payments
                WHERE order_id = :id
                FOR UPDATE
                """,
                {"id": order_id},
            )

            row = cur.fetchone()

            if not row:
                raise HTTPException(
                    404,
                    "No payment found for this order.",
                )

            if row[0] != COD:
                raise HTTPException(
                    409,
                    "Online payments are completed by the customer. Only Cash on Delivery payments can be changed here.",
                )

            cur.execute(
                """
                UPDATE payments
                SET payment_status = :status
                WHERE order_id = :id
                """,
                {"status": body.status, "id": order_id},
            )

        conn.commit()

    except HTTPException:
        conn.rollback()
        raise

    except oracledb.DatabaseError as error:
        conn.rollback()
        raise HTTPException(
            400,
            f"Could not update payment: {error}",
        )

    return {
        "id": f"ORD-{order_id}",
        "paymentStatus": body.status,
    }