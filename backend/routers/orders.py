import oracledb
from fastapi import APIRouter, Depends, HTTPException
from auth import require_admin, require_customer
from db import get_conn, fetch_all
from schemas import OrderIn, StatusIn

router = APIRouter(tags=["orders"])

ORDER_STATUSES = ("Pending", "Shipped", "Delivered", "Cancelled")
PAYMENT_STATUSES = ("Pending", "Completed", "Failed")

ORDERS_SQL = """
    SELECT o.order_id, TO_CHAR(o.order_date, 'YYYY-MM-DD') AS order_date,
           c.customer_name AS customer, o.total_amount AS total,
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
    """Orders with their items. `where` is a fixed string written in this file, never user input."""
    orders = fetch_all(conn, ORDERS_SQL + where + " ORDER BY o.order_id DESC", params)
    items_sql = ITEMS_SQL
    if where:
        items_sql += " WHERE oi.order_id IN (SELECT o.order_id FROM orders o " + where + ")"
    by_order = {}
    for it in fetch_all(conn, items_sql, params):
        by_order.setdefault(it.pop("order_id"), []).append(it)
    return [
        {
            "id": f"ORD-{o['order_id']}",
            "date": o["order_date"],
            "customer": o["customer"],
            "total": o["total"],
            "status": o["status"],
            "payment": o["payment"] or "",
            "paymentStatus": o["payment_status"] or "",
            "items": by_order.get(o["order_id"], []),
        }
        for o in orders
    ]


@router.get("/orders", dependencies=[Depends(require_admin)])
def list_all_orders(conn=Depends(get_conn)):
    """Every order. Admin only."""
    return build_orders(conn)


@router.get("/orders/mine")
def list_my_orders(claims=Depends(require_customer), conn=Depends(get_conn)):
    """Only the signed-in customer's own orders."""
    return build_orders(conn, "WHERE o.customer_id = :cid", {"cid": int(claims["sub"])})


@router.post("/orders", status_code=201)
def create_order(order: OrderIn, claims=Depends(require_customer), conn=Depends(get_conn)):
    """Create the order, items and payment in ONE transaction for the signed-in customer."""
    customer_id = int(claims["sub"])
    try:
        with conn.cursor() as cur:
            lines, total = [], 0
            for it in sorted(order.items, key=lambda i: i.productId):
                cur.execute(
                    "SELECT stock_quantity, price, product_name FROM products WHERE product_id = :id FOR UPDATE",
                    {"id": it.productId},
                )
                prod = cur.fetchone()
                if not prod:
                    raise HTTPException(404, f"Product {it.productId} does not exist.")
                stock, price, pname = prod
                if it.qty > stock:
                    raise HTTPException(409, f"Only {stock} of '{pname}' left in stock.")
                lines.append((it.productId, it.qty, price))
                total += price * it.qty
            total = round(total, 2)

            oid = cur.var(int)
            cur.execute(
                """INSERT INTO orders (order_id, customer_id, total_amount)
                   VALUES (orders_seq.NEXTVAL, :c, :t) RETURNING order_id INTO :id""",
                {"c": customer_id, "t": total, "id": oid},
            )
            order_id = oid.getvalue()[0]

            for pid, qty, price in lines:
                cur.execute(
                    """INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price)
                       VALUES (order_items_seq.NEXTVAL, :o, :p, :q, :u)""",
                    {"o": order_id, "p": pid, "q": qty, "u": price},
                )
                cur.execute(
                    "UPDATE products SET stock_quantity = stock_quantity - :q WHERE product_id = :p",
                    {"q": qty, "p": pid},
                )

            cur.execute(
                """INSERT INTO payments (payment_id, order_id, amount, payment_method)
                   VALUES (payments_seq.NEXTVAL, :o, :a, :m)""",
                {"o": order_id, "a": total, "m": order.payment},
            )
        conn.commit()
    except HTTPException:
        conn.rollback()
        raise
    except oracledb.DatabaseError as e:
        conn.rollback()
        raise HTTPException(400, f"Could not place order: {e}")
    return {"orderId": f"ORD-{order_id}", "total": total}


@router.patch("/orders/{order_ref}/status", dependencies=[Depends(require_admin)])
def update_order_status(order_ref: str, body: StatusIn, conn=Depends(get_conn)):
    """Change an order's status. Cancelling returns the items to stock."""
    oid = parse_order_id(order_ref)
    new = body.status
    if new not in ORDER_STATUSES:
        raise HTTPException(400, f"Status must be one of: {', '.join(ORDER_STATUSES)}.")
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT status FROM orders WHERE order_id = :id FOR UPDATE", {"id": oid})
            row = cur.fetchone()
            if not row:
                raise HTTPException(404, "Order not found.")
            old = row[0]
            if old == new:
                return {"id": f"ORD-{oid}", "status": new}
            if old == "Cancelled":
                raise HTTPException(409, "A cancelled order can't be reopened.")
            if old == "Delivered" and new == "Cancelled":
                raise HTTPException(409, "A delivered order can't be cancelled.")

            cur.execute("UPDATE orders SET status = :s WHERE order_id = :id", {"s": new, "id": oid})

            if new == "Cancelled":
                cur.execute(
                    """UPDATE products p
                       SET stock_quantity = stock_quantity + (
                           SELECT NVL(SUM(oi.quantity), 0) FROM order_items oi
                           WHERE oi.order_id = :id AND oi.product_id = p.product_id)
                       WHERE p.product_id IN (SELECT product_id FROM order_items WHERE order_id = :id)""",
                    {"id": oid},
                )
                cur.execute(
                    "UPDATE payments SET payment_status = 'Failed' WHERE order_id = :id AND payment_status = 'Pending'",
                    {"id": oid},
                )
        conn.commit()
    except HTTPException:
        conn.rollback()
        raise
    except oracledb.DatabaseError as e:
        conn.rollback()
        raise HTTPException(400, f"Could not update order: {e}")
    return {"id": f"ORD-{oid}", "status": new}


@router.patch("/orders/{order_ref}/payment", dependencies=[Depends(require_admin)])
def update_payment_status(order_ref: str, body: StatusIn, conn=Depends(get_conn)):
    oid = parse_order_id(order_ref)
    if body.status not in PAYMENT_STATUSES:
        raise HTTPException(400, f"Payment status must be one of: {', '.join(PAYMENT_STATUSES)}.")
    try:
        with conn.cursor() as cur:
            cur.execute("UPDATE payments SET payment_status = :s WHERE order_id = :id",
                        {"s": body.status, "id": oid})
            if cur.rowcount == 0:
                conn.rollback()
                raise HTTPException(404, "No payment found for this order.")
        conn.commit()
    except HTTPException:
        raise
    except oracledb.DatabaseError as e:
        conn.rollback()
        raise HTTPException(400, f"Could not update payment: {e}")
    return {"id": f"ORD-{oid}", "paymentStatus": body.status}