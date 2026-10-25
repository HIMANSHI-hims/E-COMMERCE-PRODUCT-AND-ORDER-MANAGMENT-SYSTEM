import oracledb
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from auth import check_password, hash_password, make_token, require_admin, token_minutes
from db import get_conn, fetch_all

router = APIRouter(prefix="/auth", tags=["auth"])

MAX_ATTEMPTS = 5
LOCK_MINUTES = 15
# Used so that unknown usernames take as long to reject as wrong passwords.
DUMMY_HASH = hash_password("not-a-real-password")


class LoginIn(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1, max_length=72)


@router.post("/login")
def login(body: LoginIn, conn=Depends(get_conn)):
    rows = fetch_all(conn, """
        SELECT admin_id, username, password_hash, full_name, is_active,
               CASE WHEN locked_until IS NOT NULL AND locked_until > SYSTIMESTAMP THEN 1 ELSE 0 END AS locked
        FROM admins WHERE LOWER(username) = LOWER(:u)
    """, {"u": body.username.strip()})

    if not rows or not rows[0]["is_active"]:
        check_password(body.password, DUMMY_HASH)
        raise HTTPException(401, "Incorrect username or password.")
    admin = rows[0]

    if admin["locked"]:
        raise HTTPException(429, f"Too many failed attempts. Try again in {LOCK_MINUTES} minutes.")

    try:
        with conn.cursor() as cur:
            if not check_password(body.password, admin["password_hash"]):
                cur.execute(
                    f"""UPDATE admins
                        SET failed_attempts = failed_attempts + 1,
                            locked_until = CASE WHEN failed_attempts + 1 >= {MAX_ATTEMPTS}
                                           THEN SYSTIMESTAMP + INTERVAL '{LOCK_MINUTES}' MINUTE
                                           ELSE locked_until END
                        WHERE admin_id = :id""",
                    {"id": admin["admin_id"]},
                )
                conn.commit()
                raise HTTPException(401, "Incorrect username or password.")
            cur.execute(
                """UPDATE admins SET failed_attempts = 0, locked_until = NULL, last_login = SYSTIMESTAMP
                   WHERE admin_id = :id""",
                {"id": admin["admin_id"]},
            )
        conn.commit()
    except oracledb.DatabaseError as e:
        conn.rollback()
        raise HTTPException(500, f"Could not sign in: {e}")

    return {
        "token": make_token(admin["admin_id"], admin["username"]),
        "username": admin["username"],
        "name": admin["full_name"] or admin["username"],
        "expiresIn": token_minutes() * 60,
    }


@router.get("/me")
def me(claims=Depends(require_admin), conn=Depends(get_conn)):
    rows = fetch_all(conn, "SELECT username, full_name, is_active FROM admins WHERE admin_id = :id",
                     {"id": int(claims["sub"])})
    if not rows or not rows[0]["is_active"]:
        raise HTTPException(401, "Admin sign-in required.")
    return {"username": rows[0]["username"], "name": rows[0]["full_name"] or rows[0]["username"]}