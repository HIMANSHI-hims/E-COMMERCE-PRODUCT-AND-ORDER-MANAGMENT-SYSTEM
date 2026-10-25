"""Create or update an admin account. Run from the backend folder:  python create_admin.py"""
import getpass
import sys

from auth import hash_password
from db import get_pool

username = input("Admin username (3-50 characters): ").strip()
full_name = input("Full name: ").strip()
password = getpass.getpass("Password (8-72 characters): ")
repeat = getpass.getpass("Repeat password: ")

if not 3 <= len(username) <= 50:
    sys.exit("Username must be 3 to 50 characters.")
if not 8 <= len(password) <= 72:
    sys.exit("Password must be 8 to 72 characters.")
if password.lower() == username.lower():
    sys.exit("Password must not match the username.")
if password != repeat:
    sys.exit("The two passwords do not match.")

conn = get_pool().acquire()
cur = conn.cursor()
cur.execute("SELECT admin_id FROM admins WHERE LOWER(username) = LOWER(:u)", {"u": username})
row = cur.fetchone()
hashed = hash_password(password)

if row:
    if input("That username exists. Replace its password? (y/N) ").strip().lower() != "y":
        sys.exit("Nothing changed.")
    cur.execute(
        """UPDATE admins SET password_hash = :h, full_name = :n, is_active = 1,
                  failed_attempts = 0, locked_until = NULL WHERE admin_id = :id""",
        {"h": hashed, "n": full_name or username, "id": row[0]},
    )
    print("Password updated.")
else:
    cur.execute(
        """INSERT INTO admins (admin_id, username, password_hash, full_name)
           VALUES (admins_seq.NEXTVAL, :u, :h, :n)""",
        {"u": username, "h": hashed, "n": full_name or username},
    )
    print("Admin created.")
conn.commit()