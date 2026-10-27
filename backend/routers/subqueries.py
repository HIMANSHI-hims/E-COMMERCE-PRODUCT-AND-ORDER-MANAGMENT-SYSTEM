import oracledb
from fastapi import APIRouter, Depends, HTTPException
from auth import require_admin
from db import get_conn

# Admin only. The browser sends just a query id; the SQL below is the only SQL that ever runs.
router = APIRouter(prefix="/subqueries", tags=["subqueries"], dependencies=[Depends(require_admin)])

MAX_ROWS = 500

QUERIES = {
    "products_above_average": {
        "title": "Products Above Average Price",
        "type": "Aggregate subquery",
        "description": "Lists products that cost more than the average price of all products. The inner query calculates the average first.",
        "sql": """SELECT product_id, product_name, price
FROM Products
WHERE price > (
    SELECT AVG(price)
    FROM Products
)
ORDER BY price DESC""",
    },
    "most_expensive_products": {
        "title": "Most Expensive Product(s)",
        "type": "Single-row aggregate subquery",
        "description": "Finds the product(s) whose price equals the highest price. The inner query returns a single value, MAX(price).",
        "sql": """SELECT product_id, product_name, price
FROM Products
WHERE price = (
    SELECT MAX(price)
    FROM Products
)""",
    },
    "orders_above_average": {
        "title": "Orders Above Average Value",
        "type": "Aggregate subquery",
        "description": "Shows orders whose total is higher than the average order total.",
        "sql": """SELECT order_id, customer_id, total_amount
FROM Orders
WHERE total_amount > (
    SELECT AVG(total_amount)
    FROM Orders
)
ORDER BY total_amount DESC""",
    },
    "customers_with_orders": {
        "title": "Customers Who Have Placed Orders",
        "type": "IN subquery",
        "description": "Returns customers whose id appears in the Orders table. The inner query supplies the list of customer ids to match.",
        "sql": """SELECT customer_id, customer_name, email
FROM Customers
WHERE customer_id IN (
    SELECT customer_id
    FROM Orders
)""",
    },
    "products_in_premium_categories": {
        "title": "Products in Categories With an Above-Average Priced Product",
        "type": "Nested subquery (IN with an inner aggregate)",
        "description": "Finds every product that belongs to a category containing at least one product priced above the overall average. Two subqueries are nested inside each other.",
        "sql": """SELECT product_id, product_name, category_id, price
FROM Products
WHERE category_id IN (
    SELECT category_id
    FROM Products
    WHERE price > (
        SELECT AVG(price)
        FROM Products
    )
)""",
    },
    "customers_without_orders": {
        "title": "Customers Who Have Never Placed Orders",
        "type": "NOT EXISTS subquery",
        "description": "Returns customers for whom no matching row exists in Orders. Useful for finding customers who registered but never bought.",
        "sql": """SELECT c.customer_id, c.customer_name, c.email
FROM Customers c
WHERE NOT EXISTS (
    SELECT 1
    FROM Orders o
    WHERE o.customer_id = c.customer_id
)""",
    },
    "never_ordered_products": {
        "title": "Products That Have Never Been Ordered",
        "type": "NOT EXISTS subquery",
        "description": "Returns products that do not appear in any order item, which helps spot slow-moving inventory.",
        "sql": """SELECT p.product_id, p.product_name, p.stock_quantity
FROM Products p
WHERE NOT EXISTS (
    SELECT 1
    FROM Order_Items oi
    WHERE oi.product_id = p.product_id
)""",
    },
    "customers_with_big_orders": {
        "title": "Customers With an Order Above ₹10,000",
        "type": "EXISTS subquery",
        "description": "Returns customers who have at least one order with a total above 10,000. EXISTS stops as soon as one matching order is found.",
        "sql": """SELECT c.customer_id, c.customer_name
FROM Customers c
WHERE EXISTS (
    SELECT 1
    FROM Orders o
    WHERE o.customer_id = c.customer_id
      AND o.total_amount > 10000
)""",
    },
    "customer_total_spent": {
        "title": "Total Spent by Each Customer",
        "type": "Derived table (subquery in FROM)",
        "description": "The inner query totals each customer's orders. The outer query joins that result to Customers, so customers with no orders show 0.",
        "sql": """SELECT
    c.customer_id,
    c.customer_name,
    NVL(s.total_spent, 0) AS total_spent
FROM Customers c
LEFT JOIN (
    SELECT customer_id, SUM(total_amount) AS total_spent
    FROM Orders
    GROUP BY customer_id
) s
    ON c.customer_id = s.customer_id
ORDER BY total_spent DESC""",
    },
    "price_vs_average": {
        "title": "Product Price Against the Average",
        "type": "Scalar subquery (subquery in SELECT)",
        "description": "Shows every product next to the overall average price. The subquery returns one value that is repeated on each row.",
        "sql": """SELECT
    p.product_id,
    p.product_name,
    p.price,
    (SELECT AVG(price) FROM Products) AS average_price
FROM Products p
ORDER BY p.product_id""",
    },
    "above_category_average": {
        "title": "Products Priced Above Their Category Average",
        "type": "Correlated subquery",
        "description": "For each product, the inner query recalculates the average price of that product's own category, then keeps the product only if it costs more.",
        "sql": """SELECT p.product_id, p.product_name, p.category_id, p.price
FROM Products p
WHERE p.price > (
    SELECT AVG(p2.price)
    FROM Products p2
    WHERE p2.category_id = p.category_id
)
ORDER BY p.category_id, p.price DESC""",
    },
}


@router.get("")
def list_queries():
    """The predefined queries (title, type, explanation and SQL text) so the page shows exactly what runs."""
    return [{"id": qid, **q} for qid, q in QUERIES.items()]


@router.post("/{query_id}/run")
def run_query(query_id: str, conn=Depends(get_conn)):
    """Run one predefined query on Oracle and return its real columns and rows."""
    q = QUERIES.get(query_id)
    if q is None:
        raise HTTPException(404, "Unknown query.")
    try:
        with conn.cursor() as cur:
            cur.execute(q["sql"])
            columns = [c[0].lower() for c in cur.description]
            rows = [list(r) for r in cur.fetchmany(MAX_ROWS)]
    except oracledb.DatabaseError as e:
        print(f"Subquery '{query_id}' failed:", e)  # full Oracle error stays in this terminal
        raise HTTPException(400, "Oracle could not run this query. Check the backend terminal for details.")
    return {"id": query_id, "columns": columns, "rows": rows, "rowCount": len(rows)}