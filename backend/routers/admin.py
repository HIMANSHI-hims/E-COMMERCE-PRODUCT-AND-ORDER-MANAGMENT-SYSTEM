from fastapi import APIRouter, Depends, Query
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


AUDIT_FROM = """
    FROM inventory_audit a
    LEFT JOIN products p ON p.product_id = a.product_id
"""


@router.get("/inventory-audit")
def inventory_audit(
    limit: int = Query(25, ge=1, le=200),
    offset: int = Query(0, ge=0),
    q: str = Query("", max_length=100),
    conn=Depends(get_conn),
):
    """Read-only view of the INVENTORY_AUDIT table (filled by the TRG_INVENTORY_AUDIT trigger)."""
    where, params = "", {}
    text = q.strip().lower()
    if text:
        escaped = text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        where = " WHERE LOWER(NVL(p.product_name, '') || ' ' || NVL(a.change_reason, '')) LIKE :q ESCAPE '\\'"
        params["q"] = f"%{escaped}%"

    total = fetch_all(conn, "SELECT COUNT(*) AS n" + AUDIT_FROM + where, params)[0]["n"]
    rows = fetch_all(
        conn,
        """SELECT a.audit_id, a.product_id,
                  NVL(p.product_name, 'Deleted product') AS product_name,
                  a.old_stock, a.new_stock, a.change_reason,
                  TO_CHAR(a.change_date, 'YYYY-MM-DD HH24:MI:SS') AS changed_at"""
        + AUDIT_FROM + where
        + """ ORDER BY a.change_date DESC, a.audit_id DESC
              OFFSET :off ROWS FETCH NEXT :lim ROWS ONLY""",
        {**params, "off": offset, "lim": limit},
    )
    return {
        "total": total,
        "rows": [
            {
                "id": r["audit_id"],
                "productId": r["product_id"],
                "product": r["product_name"],
                "oldStock": r["old_stock"],
                "newStock": r["new_stock"],
                "reason": r["change_reason"] or "",
                "changedAt": r["changed_at"],
            }
            for r in rows
        ],
    }