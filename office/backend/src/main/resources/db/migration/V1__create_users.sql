-- ─────────────────────────────────────────────────────────────
-- V1 — users table
-- Employee and admin accounts
-- ─────────────────────────────────────────────────────────────

CREATE TABLE users (
    id            BIGSERIAL       PRIMARY KEY,
    employee_id   VARCHAR(50)     NOT NULL UNIQUE,
    username      VARCHAR(100)    NOT NULL UNIQUE,
    password_hash TEXT            NOT NULL,
    full_name     VARCHAR(255)    NOT NULL,
    designation   VARCHAR(255),
    joining_date  DATE,
    phone         VARCHAR(30),
    role          VARCHAR(50)     NOT NULL DEFAULT 'employee',
    is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Index for login lookups
CREATE INDEX idx_users_username   ON users(username);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_role       ON users(role);
CREATE INDEX idx_users_is_active  ON users(is_active);

COMMENT ON TABLE  users             IS 'Employee and admin accounts for Nevolyn Office Management';
COMMENT ON COLUMN users.employee_id IS 'Official company badge ID (e.g. EMP-001, ADMIN-001)';
COMMENT ON COLUMN users.role        IS 'admin: unrestricted access | employee: LAN-only access';
COMMENT ON COLUMN users.is_active   IS 'FALSE = deactivated account, login is blocked';
