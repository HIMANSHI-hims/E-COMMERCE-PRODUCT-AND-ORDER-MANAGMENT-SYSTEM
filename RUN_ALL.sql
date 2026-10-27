-- run_all.sql : runs every project script in one go
-- Put this file in the SAME folder as the other .sql files.
-- @@ means "run this file from the same folder as this script".

SET ECHO ON
SET SERVEROUTPUT ON
WHENEVER SQLERROR CONTINUE     -- keep going if one script has an error

PROMPT ===== 1. TABLES =====
@@create_table.sql
@@ALTER.sql
@@image.sql
@@admins.sql

PROMPT ===== 2. DATA =====
@@insert_data.sql
@@ddl_dml.sql

PROMPT ===== 3. INDEXES (use ONE of these, not all) =====
@@indexes.sql
-- @@create_indexes.sql
-- @@index_correction.sql

PROMPT ===== 4. VIEWS =====
@@VIEW.SQL
@@view_data.sql

PROMPT ===== 5. QUERIES: functions, operators, joins, subqueries =====
@@functions.sql
@@operators_aggregates.sql
@@joins_subqueries.sql
@@SUBQUEIRES.sql
@@customer_order_details.sql

PROMPT ===== 6. VALIDATION AND TRIGGERS =====
@@inventory_validation.sql
@@order_validation.sql
@@payment_validation.sql
@@payment_trigger.sql
@@inventory_audit.sql

-- Left out on purpose (check what they do before enabling):
-- @@reset_and_update.sql    -- looks like it resets data
-- @@e1.sql                  -- unknown purpose

PROMPT ===== ALL SCRIPTS FINISHED =====