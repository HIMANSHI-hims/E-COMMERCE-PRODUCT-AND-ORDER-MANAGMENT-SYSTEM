"""
backend/routers/cursor_search.py

Product search that uses an EXPLICIT PL/SQL CURSOR.
The cursor is declared, opened, fetched one row at a time in a loop,
and closed inside an anonymous PL/SQL block. Each fetched row is written
with DBMS_OUTPUT, and Python reads those lines back and returns them as JSON.
"""
import oracledb
from fastapi import APIRouter, Depends, HTTPException, Query
from db import get_conn

router = APIRouter(tags=["cursor-search"])

CURSOR_PLSQL = """
DECLARE
    -- 1. DECLARE: explicit cursor with a parameter
    CURSOR product_cursor (p_search IN VARCHAR2) IS
        SELECT product_id, product_name, price, stock_quantity
        FROM   products
        WHERE  UPPER(product_name) LIKE '%' || UPPER(p_search) || '%'
        ORDER  BY product_id;

    -- Variables that hold one fetched row
    v_product_id   products.product_id%TYPE;
    v_product_name products.product_name%TYPE;
    v_price        products.price%TYPE;
    v_stock        products.stock_quantity%TYPE;
BEGIN
    -- 2. OPEN the cursor
    OPEN product_cursor(:search);

    LOOP
        -- 3. FETCH one row at a time
        FETCH product_cursor
        INTO v_product_id, v_product_name, v_price, v_stock;

        -- Stop when there are no more rows (or the row limit is passed)
        EXIT WHEN product_cursor%NOTFOUND
               OR product_cursor%ROWCOUNT > :max_rows;

        DBMS_OUTPUT.PUT_LINE(
            v_product_id || CHR(9) || v_product_name || CHR(9) ||
            ROUND(v_price) || CHR(9) || v_stock
        );
    END LOOP;

    -- Cursor attributes: how many rows were fetched, and were there more?
    :fetched := LEAST(product_cursor%ROWCOUNT, :max_rows);

    IF product_cursor%ROWCOUNT > :max_rows THEN
        :has_more := 1;
    ELSE
        :has_more := 0;
    END IF;

    -- 4. CLOSE the cursor
    CLOSE product_cursor;
END;
"""


@router.get("/cursor-search")
def cursor_search(
    q: str = Query("", max_length=60),
    limit: int = Query(50, ge=1, le=200),
    conn=Depends(get_conn),
):
    search = q.strip()

    try:
        with conn.cursor() as cur:
            # Turn on DBMS_OUTPUT for this session (unlimited buffer)
            cur.execute("BEGIN DBMS_OUTPUT.ENABLE(NULL); END;")

            fetched = cur.var(int)
            has_more = cur.var(int)

            cur.execute(
                CURSOR_PLSQL,
                {
                    "search": search,
                    "max_rows": limit,
                    "fetched": fetched,
                    "has_more": has_more,
                },
            )

            # Read back the lines the cursor loop printed
            rows = []
            line = cur.var(str)
            status = cur.var(int)

            while True:
                cur.callproc("DBMS_OUTPUT.GET_LINE", (line, status))

                if status.getvalue() != 0:
                    break

                product_id, name, price, stock = line.getvalue().split("\t")
                rows.append(
                    {
                        "id": int(product_id),
                        "name": name,
                        "price": float(price),
                        "stock": int(stock),
                    }
                )

            return {
                "query": search,
                "rows": rows,
                "rowcount": int(fetched.getvalue() or 0),
                "hasMore": bool(has_more.getvalue()),
                "plsql": CURSOR_PLSQL.strip(),
            }

    except oracledb.DatabaseError as error:
        raise HTTPException(400, f"Cursor search failed: {error}")