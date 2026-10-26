import oracledb
from fastapi import APIRouter, Depends, HTTPException

from auth import (check_password, customer_token_minutes, hash_password,
                  make_customer_token, require_customer)
from db import get_conn, fetch_all
from schemas import CustomerLoginIn, RegisterIn

router = APIRouter(prefix="/account", tags=["account"])

MAX_ATTEMPTS = 5
LOCK_MINUTES = 15
DUMMY_HASH = hash_password("not-a-real-password")  # keeps timing equal for unknown emails


def profile(row):
    return {"id": row["customer_id"], "name": row["customer_name"], "email": row["email"],
            "phone": row["phone"], "address": row["address"]}


def session(row):
    return {"token": make_customer_token(row["customer_id"], row["customer_name"]),
            "customer": profile(row), "expiresIn": customer_token_minutes() * 60}


@router.post("/register", status_code=201)
def register(body: RegisterIn, conn=Depends(get_conn)):
    """New user: store the customer (with a hashed password) and sign them in."""
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM customers WHERE LOWER(email) = :e", {"e": body.email})
            if cur.fetchone():
                raise HTTPException(409, "An account with this email already exists. Please sign in.")
            cid = cur.var(int)
            cur.execute(
                """INSERT INTO customers (customer_id, customer_name, email, phone, address, password_hash)
                   VALUES (customers_seq.NEXTVAL, :n, :e, :p, :a, :h)
                   RETURNING customer_id INTO :id""",
                {"n": body.name, "e": body.email, "p": body.phone, "a": body.address,
                 "h": hash_password(body.password), "id": cid},
            )
            customer_id = cid.getvalue()[0]
        conn.commit()
    except HTTPException:
        conn.rollback()
        raise
    except oracledb.IntegrityError:
        conn.rollback()
        raise HTTPException(409, "An account with this email already exists. Please sign in.")
    except oracledb.DatabaseError as e:
        conn.rollback()
        raise HTTPException(400, f"Could not create the account: {e}")
    return session({"customer_id": customer_id, "customer_name": body.name, "email": body.email,
                    "phone": body.phone, "address": body.address})


@router.post("/login")
def login(body: CustomerLoginIn, conn=Depends(get_conn)):
    """Existing user: check the email and password against the CUSTOMERS table."""
    rows = fetch_all(conn, """
        SELECT customer_id, customer_name, email, phone, address, password_hash,
               CASE WHEN locked_until IS NOT NULL AND locked_until > SYSTIMESTAMP THEN 1 ELSE 0 END AS locked
        FROM customers WHERE LOWER(email) = LOWER(:e)
    """, {"e": body.email.strip()})

    if not rows or not rows[0]["password_hash"]:
        check_password(body.password, DUMMY_HASH)
        raise HTTPException(401, "Incorrect email or password.")
    row = rows[0]
    if row["locked"]:
        raise HTTPException(429, f"Too many failed attempts. Try again in {LOCK_MINUTES} minutes.")

    try:
        with conn.cursor() as cur:
            if not check_password(body.password, row["password_hash"]):
                cur.execute(
                    f"""UPDATE customers
                        SET failed_attempts = failed_attempts + 1,
                            locked_until = CASE WHEN failed_attempts + 1 >= {MAX_ATTEMPTS}
                                           THEN SYSTIMESTAMP + INTERVAL '{LOCK_MINUTES}' MINUTE
                                           ELSE locked_until END
                        WHERE customer_id = :id""",
                    {"id": row["customer_id"]},
                )
                conn.commit()
                raise HTTPException(401, "Incorrect email or password.")
            cur.execute(
                """UPDATE customers SET failed_attempts = 0, locked_until = NULL, last_login = SYSTIMESTAMP
                   WHERE customer_id = :id""",
                {"id": row["customer_id"]},
            )
        conn.commit()
    except oracledb.DatabaseError as e:
        conn.rollback()
        raise HTTPException(500, f"Could not sign in: {e}")
    return session(row)


@router.get("/me")
def me(claims=Depends(require_customer), conn=Depends(get_conn)):
    rows = fetch_all(conn, """SELECT customer_id, customer_name, email, phone, address
                              FROM customers WHERE customer_id = :id""", {"id": int(claims["sub"])})
    if not rows:
        raise HTTPException(401, "Please sign in to continue.")
    return profile(rows[0])