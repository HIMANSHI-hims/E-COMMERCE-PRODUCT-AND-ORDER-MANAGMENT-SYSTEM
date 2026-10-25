import oracledb
from fastapi import APIRouter, Depends, HTTPException
from db import get_conn, fetch_all
from schemas import ProductIn
from auth import require_admin

router = APIRouter(tags=["products"])

PRODUCT_SQL = """
    SELECT p.product_id AS id, p.product_name AS name,
           NVL(c.category_name, 'Uncategorized') AS category,
           NVL(p.brand, 'Unbranded') AS brand, p.price,
           p.stock_quantity AS stock, NVL(p.image_url, '') AS image
    FROM products p
    LEFT JOIN categories c ON c.category_id = p.category_id
"""


def get_or_create_category(cur, name):
    cur.execute(
        "SELECT category_id FROM categories WHERE LOWER(category_name) = LOWER(:n)",
        {"n": name},
    )
    row = cur.fetchone()
    if row:
        return row[0]
    new_id = cur.var(int)
    cur.execute(
        """INSERT INTO categories (category_id, category_name)
           VALUES (categories_seq.NEXTVAL, :n) RETURNING category_id INTO :i""",
        {"n": name, "i": new_id},
    )
    return new_id.getvalue()[0]


@router.get("/products")
def list_products(conn=Depends(get_conn)):
    return fetch_all(conn, PRODUCT_SQL + " ORDER BY p.product_id")


@router.get("/inventory")
def list_inventory(conn=Depends(get_conn)):
    return fetch_all(conn, PRODUCT_SQL + " ORDER BY p.stock_quantity, p.product_id")


@router.get("/categories")
def list_categories(conn=Depends(get_conn)):
    rows = fetch_all(conn, "SELECT category_name FROM categories ORDER BY category_name")
    return [r["category_name"] for r in rows]


@router.post("/products", status_code=201, dependencies=[Depends(require_admin)])
def create_product(p: ProductIn, conn=Depends(get_conn)):
    try:
        with conn.cursor() as cur:
            cat_id = get_or_create_category(cur, p.category.strip())
            new_id = cur.var(int)
            cur.execute(
                """INSERT INTO products (product_id, category_id, product_name, price,
                                         stock_quantity, brand, image_url)
                   VALUES (products_seq.NEXTVAL, :c, :n, :p, :s, :b, :i)
                   RETURNING product_id INTO :pid""",
                {"c": cat_id, "n": p.name.strip(), "p": p.price, "s": p.stock,
                 "b": p.brand.strip(), "i": p.image, "pid": new_id},
            )
            pid = new_id.getvalue()[0]
        conn.commit()
    except oracledb.DatabaseError as e:
        conn.rollback()
        raise HTTPException(400, f"Could not create product: {e}")
    return {**p.model_dump(), "id": pid}


@router.put("/products/{product_id}", dependencies=[Depends(require_admin)])
def update_product(product_id: int, p: ProductIn, conn=Depends(get_conn)):
    try:
        with conn.cursor() as cur:
            cat_id = get_or_create_category(cur, p.category.strip())
            cur.execute(
                """UPDATE products SET category_id=:c, product_name=:n, price=:p,
                          stock_quantity=:s, brand=:b, image_url=:i
                   WHERE product_id=:pid""",
                {"c": cat_id, "n": p.name.strip(), "p": p.price, "s": p.stock,
                 "b": p.brand.strip(), "i": p.image, "pid": product_id},
            )
            if cur.rowcount == 0:
                conn.rollback()
                raise HTTPException(404, "Product not found")
        conn.commit()
    except oracledb.DatabaseError as e:
        conn.rollback()
        raise HTTPException(400, f"Could not update product: {e}")
    return {**p.model_dump(), "id": product_id}


@router.delete("/products/{product_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_product(product_id: int, conn=Depends(get_conn)):
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM products WHERE product_id = :id", {"id": product_id})
            if cur.rowcount == 0:
                conn.rollback()
                raise HTTPException(404, "Product not found")
        conn.commit()
    except oracledb.IntegrityError:
        conn.rollback()
        raise HTTPException(409, "This product appears in existing orders and cannot be deleted.")
    except oracledb.DatabaseError as e:
        conn.rollback()
        raise HTTPException(400, f"Could not delete product: {e}")