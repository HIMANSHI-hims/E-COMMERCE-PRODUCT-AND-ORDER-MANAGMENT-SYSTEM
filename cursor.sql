-- EXPLICIT CURSOR WITH A PARAMETER: search products one row at a time
-- Run this in SQL Developer first to check it works before using the app.

SET SERVEROUTPUT ON;

DECLARE
    v_search VARCHAR2(60) := 'acer';   -- change this to search for something else

    -- Declare the cursor (takes a search term as a parameter)
    CURSOR product_cursor (p_search IN VARCHAR2) IS
        SELECT product_id, product_name, price, stock_quantity
        FROM   PRODUCTS
        WHERE  UPPER(product_name) LIKE '%' || UPPER(p_search) || '%'
        ORDER  BY product_id;

    -- Variables to store each fetched row
    v_product_id   PRODUCTS.product_id%TYPE;
    v_product_name PRODUCTS.product_name%TYPE;
    v_price        PRODUCTS.price%TYPE;
    v_stock        PRODUCTS.stock_quantity%TYPE;
BEGIN
    -- Open the cursor
    OPEN product_cursor(v_search);

    LOOP
        -- Fetch one row at a time
        FETCH product_cursor
        INTO v_product_id, v_product_name, v_price, v_stock;

        -- Exit when no more rows are available
        EXIT WHEN product_cursor%NOTFOUND;

        DBMS_OUTPUT.PUT_LINE(
            'Product ID: ' || v_product_id ||
            ' | Name: ' || v_product_name ||
            ' | Price: ' || ROUND(v_price) ||
            ' | Stock: ' || v_stock
        );
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('Rows fetched: ' || product_cursor%ROWCOUNT);

    -- Close the cursor
    CLOSE product_cursor;
END;
/