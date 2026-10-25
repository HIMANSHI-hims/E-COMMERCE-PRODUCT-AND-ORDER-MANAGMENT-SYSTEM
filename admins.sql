CREATE TABLE ADMINS (
    admin_id        NUMBER(5) PRIMARY KEY,
    username        VARCHAR2(50) UNIQUE NOT NULL,
    password_hash   VARCHAR2(200) NOT NULL,
    full_name       VARCHAR2(100),
    is_active       NUMBER(1) DEFAULT 1 NOT NULL CHECK (is_active IN (0, 1)),
    failed_attempts NUMBER(2) DEFAULT 0 NOT NULL,
    locked_until    TIMESTAMP,
    last_login      TIMESTAMP,
    created_at      DATE DEFAULT SYSDATE NOT NULL
);
CREATE SEQUENCE admins_seq START WITH 1;