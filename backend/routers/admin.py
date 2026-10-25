from fastapi import APIRouter, Depends
from auth import require_admin
from db import get_conn, fetch_all

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/stats")
def stats(conn=Depends(get_conn)):
    return fetch_all(conn, """
        SELECT (SELECT COUNT(*) FROM customers) AS customers,
               (SELECT COUNT(*) FROM products)  AS products,
               (SELECT COUNT(*) FROM orders)    AS orders,
               (SELECT NVL(SUM(total_amount), 0) FROM orders WHERE status <> 'Cancelled') AS revenue
        FROM dual
    """)[0]