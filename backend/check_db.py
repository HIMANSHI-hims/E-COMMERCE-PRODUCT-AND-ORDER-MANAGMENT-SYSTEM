from db import get_pool

conn = get_pool().acquire()
cur = conn.cursor()

cur.execute("select user, sys_context('USERENV', 'SERVICE_NAME') from dual")
print("User and service:", cur.fetchone())

cur.execute("select column_name from user_tab_columns where table_name = 'PRODUCTS'")
print("PRODUCTS columns:", [r[0] for r in cur.fetchall()])