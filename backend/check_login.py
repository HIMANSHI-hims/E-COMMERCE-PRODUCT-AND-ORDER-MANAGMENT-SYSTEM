"""Run from backend/ with the venv active:  python check_login.py"""
import getpass
import importlib
import os
import sys
import traceback


def step(title):
    print(f"\n== {title}")


def ok(msg):
    print("   OK:", msg)


def bad(msg, fix=""):
    print("   PROBLEM:", msg)
    if fix:
        print("   FIX:", fix)


step("1. Packages")
missing = []
for name, pip_name in [("fastapi", "fastapi"), ("oracledb", "oracledb"), ("dotenv", "python-dotenv"),
                       ("bcrypt", "bcrypt"), ("jwt", "PyJWT")]:
    try:
        importlib.import_module(name)
        ok(name)
    except Exception as e:
        missing.append(pip_name)
        bad(f"{name} cannot be imported ({e})")
if missing:
    print("\n   Run: pip install " + " ".join(missing))
    sys.exit(1)

from dotenv import load_dotenv
load_dotenv()

step("2. Settings in backend/.env")
secret = os.getenv("JWT_SECRET", "")
if len(secret) >= 32:
    ok(f"JWT_SECRET is set ({len(secret)} characters)")
else:
    bad(f"JWT_SECRET is missing or too short ({len(secret)} characters)",
        'run: python -c "import secrets; print(secrets.token_urlsafe(48))" and put the result in .env as JWT_SECRET=...')
for key in ["ORACLE_USER", "ORACLE_PASSWORD", "ORACLE_DSN"]:
    if os.getenv(key):
        ok(f"{key} is set")
    else:
        bad(f"{key} is missing in backend/.env")

step("3. Backend code loads")
try:
    import main  # noqa: F401
    ok("main.py and the routers import without errors")
except Exception:
    traceback.print_exc()
    bad("main.py failed to load (see the error above)", "the last line above names the missing file, class or package")
    sys.exit(1)

step("4. Database connection")
try:
    from db import get_pool
    conn = get_pool().acquire()
    cur = conn.cursor()
    cur.execute("select user, sys_context('USERENV','SERVICE_NAME') from dual")
    ok("connected as %s on service %s" % cur.fetchone())
except Exception as e:
    bad(str(e), "check ORACLE_USER, ORACLE_PASSWORD and ORACLE_DSN in backend/.env")
    sys.exit(1)

step("5. ADMINS table")
cur.execute("select column_name from user_tab_columns where table_name = 'ADMINS'")
cols = {r[0] for r in cur.fetchall()}
needed = {"ADMIN_ID", "USERNAME", "PASSWORD_HASH", "FULL_NAME", "IS_ACTIVE",
          "FAILED_ATTEMPTS", "LOCKED_UNTIL", "LAST_LOGIN"}
if not cols:
    bad("table ADMINS does not exist for this user", "run the CREATE TABLE ADMINS script in SQL Developer")
    sys.exit(1)
if needed - cols:
    bad("missing columns: " + ", ".join(sorted(needed - cols)))
    sys.exit(1)
ok("table and columns found")

step("6. Admin accounts")
cur.execute("select username, is_active, failed_attempts, "
            "case when locked_until > systimestamp then 'LOCKED' else 'ok' end from admins")
rows = cur.fetchall()
if not rows:
    bad("no admin account exists", "run: python create_admin.py")
    sys.exit(1)
for r in rows:
    print(f"   account {r[0]!r}: active={r[1]}, failed_attempts={r[2]}, lock={r[3]}")

step("7. Test your sign-in (nothing is saved)")
from auth import check_password, make_token
user = input("   Username: ").strip()
pw = getpass.getpass("   Password: ")
cur.execute("select admin_id, username, password_hash, is_active from admins where lower(username) = lower(:u)",
            {"u": user})
row = cur.fetchone()
if not row:
    bad("no account has that username", "compare it with the accounts listed in step 6 (spelling and spaces)")
elif not row[3]:
    bad("that account is inactive")
elif not check_password(pw, row[2]):
    bad("the password does not match", "run python create_admin.py, use the same username and answer y to replace the password")
else:
    ok("username and password are correct")
    try:
        make_token(row[0], row[1])
        ok("a sign-in token can be created")
    except Exception as e:
        bad(str(getattr(e, "detail", e)))