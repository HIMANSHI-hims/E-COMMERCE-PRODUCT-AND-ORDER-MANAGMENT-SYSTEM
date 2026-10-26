from fastapi import APIRouter, Depends
from db import get_conn, fetch_all

router = APIRouter(tags=["public"])


@router.get("/stats/overview")
def overview(conn=Depends(get_conn)):
    return fetch_all(conn, """
        SELECT (SELECT COUNT(*) FROM products)                        AS products,
               (SELECT COUNT(*) FROM categories)                      AS categories,
               (SELECT COUNT(*) FROM orders)                          AS orders,
               (SELECT COUNT(*) FROM products WHERE stock_quantity > 0) AS in_stock
        FROM dual
    """)[0]