SELECT
    s.sid,
    s.serial#,
    s.username,
    s.status,
    s.machine,
    s.program,
    s.module,
    s.logon_time,
    t.start_time,
    t.used_ublk,
    t.used_urec
FROM v$session s
LEFT JOIN v$transaction t
    ON s.taddr = t.addr
WHERE s.sid = 162
  AND s.serial# = 15592;