SELECT USER FROM dual;
SELECT sys_context('USERENV', 'SERVICE_NAME') AS service FROM dual;
SELECT column_name FROM user_tab_columns WHERE table_name = 'PRODUCTS';
ALTER TABLE PRODUCTS ADD (image_url VARCHAR2(500));