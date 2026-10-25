import os
import oracledb
from dotenv import load_dotenv

load_dotenv()

_pool = None


def get_pool():
    """Create the connection pool on first use."""
    global _pool
    if _pool is None:
        _pool = oracledb.create_pool(
            user=os.getenv("ORACLE_USER"),
            password=os.getenv("ORACLE_PASSWORD"),
            dsn=os.getenv("ORACLE_DSN"),
            min=1,
            max=5,
            increment=1,
        )
    return _pool


def get_conn():
    """FastAPI dependency: gives each request a connection and always returns it."""
    conn = get_pool().acquire()
    try:
        yield conn
    finally:
        get_pool().release(conn)


def fetch_all(conn, sql, params=None):
    """Run a SELECT and return a list of dicts with lowercase keys."""
    with conn.cursor() as cur:
        cur.execute(sql, params or {})
        cols = [c[0].lower() for c in cur.description]
        return [dict(zip(cols, row)) for row in cur.fetchall()]