import oracledb
from fastapi import APIRouter, Depends, HTTPException
from db import get_conn, fetch_all
from schemas import OrderIn

router = APIRouter(tags=["orders"])


@router.get("/orders")
def list_orders(conn=Depends(get_conn)):
    orders = fetch_all(conn, """
        SELECT o.order_id, TO_CHAR(o.order_date, 'YYYY-MM-DD') AS order_date,
               c.customer_name AS customer, o.total_amount AS total,
               INITCAP(o.status) AS status, pay.payment_method AS payment
        FROM orders o
        JOIN customers c ON c.customer_id = o.customer_id
        LEFT JOIN payments pay ON pay.order_id = o.order_id
        ORDER BY o.order_id DESC
    """)
    items = fetch_all(conn, """
        SELECT oi.order_id, oi.product_id AS "productId", pr.product_name AS name,
               oi.quantity AS qty, oi.unit_price AS price
        FROM order_items oi
        JOIN products pr ON pr.product_id = oi.product_id
    """)
    by_order = {}
    for it in items:
        by_order.setdefault(it.pop("order_id"), []).append(it)

    return [
        {
            "id": f"ORD-{o['order_id']}",
            "date": o["order_date"],
            "customer": o["customer"],
            "total": o["total"],
            "status": o["status"],
            "payment": o["payment"] or "",
            "items": by_order.get(o["order_id"], []),
        }
        for o in orders
    ]


@router.post("/orders", status_code=201)
def create_order(order: OrderIn, conn=Depends(get_conn)):
    """Create the customer, order, items and payment in ONE transaction."""
    try:
        with conn.cursor() as cur:
            # 1. Find the customer by email, or create one
            c = order.customer
            address = f"{c.address}, {c.city} - {c.pincode}"[:200]
            cur.execute("SELECT customer_id FROM customers WHERE LOWER(email) = LOWER(:e)", {"e": c.email})
            row = cur.fetchone()
            if row:
                customer_id = row[0]
            else:
                cid = cur.var(int)
                cur.execute(
                    """INSERT INTO customers (customer_id, customer_name, email, phone, address)
                       VALUES (customers_seq.NEXTVAL, :n, :e, :p, :a)
                       RETURNING customer_id INTO :id""",
                    {"n": c.name, "e": c.email, "p": c.phone, "a": address, "id": cid},
                )
                customer_id = cid.getvalue()[0]

            # 2. Lock each product, check stock, and use the DATABASE price
            lines, total = [], 0
            for it in order.items:
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

            # 3. Insert the order (order_date and status use the table defaults)
            oid = cur.var(int)
            cur.execute(
                """INSERT INTO orders (order_id, customer_id, total_amount)
                   VALUES (orders_seq.NEXTVAL, :c, :t) RETURNING order_id INTO :id""",
                {"c": customer_id, "t": total, "id": oid},
            )
            order_id = oid.getvalue()[0]

            # 4. Insert items and reduce stock
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

            # 5. Insert the payment record (date and status use the table defaults)
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