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


def make_token(admin_id: int, username: str) -> str:
    now = int(time.time())
    payload = {"sub": str(admin_id), "usr": username, "role": "admin",
               "iat": now, "exp": now + token_minutes() * 60}
    return jwt.encode(payload, _secret(), algorithm=ALGORITHM)


def require_admin(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer)):
    """Dependency for every admin-only route."""
    if creds is None:
        raise HTTPException(401, "Admin sign-in required.")
    try:
        data = jwt.decode(creds.credentials, _secret(), algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Your session expired. Please sign in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Admin sign-in required.")
    if data.get("role") != "admin":
        raise HTTPException(403, "Not allowed.")
    return data