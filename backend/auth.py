import os
import time
from typing import Optional

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

load_dotenv()

ALGORITHM = "HS256"
bearer = HTTPBearer(auto_error=False)  # also gives /docs an "Authorize" button


def _secret() -> str:
    secret = os.getenv("JWT_SECRET", "")
    if len(secret) < 32:
        raise HTTPException(500, "Server is missing a strong JWT_SECRET in .env.")
    return secret


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def check_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except ValueError:
        return False


def token_minutes() -> int:
    return int(os.getenv("JWT_EXPIRE_MINUTES", "60"))


def customer_token_minutes() -> int:
    return int(os.getenv("CUSTOMER_TOKEN_MINUTES", "720"))


def _make(subject: int, name: str, role: str, minutes: int) -> str:
    now = int(time.time())
    payload = {"sub": str(subject), "usr": name, "role": role, "iat": now, "exp": now + minutes * 60}
    return jwt.encode(payload, _secret(), algorithm=ALGORITHM)


def make_token(admin_id: int, username: str) -> str:
    return _make(admin_id, username, "admin", token_minutes())


def make_customer_token(customer_id: int, name: str) -> str:
    return _make(customer_id, name, "customer", customer_token_minutes())


def _check(creds: Optional[HTTPAuthorizationCredentials], role: str, missing: str):
    if creds is None:
        raise HTTPException(401, missing)
    try:
        data = jwt.decode(creds.credentials, _secret(), algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Your session expired. Please sign in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(401, missing)
    if data.get("role") != role:
        raise HTTPException(403, "Not allowed.")
    return data


def require_admin(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer)):
    """Dependency for every admin-only route."""
    return _check(creds, "admin", "Admin sign-in required.")


def require_customer(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer)):
    """Dependency for routes that need a signed-in customer."""
    return _check(creds, "customer", "Please sign in to continue.")