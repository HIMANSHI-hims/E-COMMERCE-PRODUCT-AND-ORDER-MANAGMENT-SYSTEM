SELECT
    s.sid,
    s.serial#,
    s.username,
    s.status,
    s.machine,
    s.program,
    o.object_name,
    l.locked_mode
FROM v$locked_object l
JOIN dba_objects o
    ON o.object_id = l.object_id
JOIN v$session s
    ON s.sid = l.session_id
WHERE o.object_name IN ('PRODUCTS', 'INVENTORY_AUDIT');