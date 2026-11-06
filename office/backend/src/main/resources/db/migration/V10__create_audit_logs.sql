-- ─────────────────────────────────────────────────────────────
-- V10 — audit_logs table
-- Comprehensive system audit trail
-- ─────────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          REFERENCES users(id) ON DELETE SET NULL,
    username        VARCHAR(100),
    action          VARCHAR(100)    NOT NULL,
    details         TEXT,
    ip_address      VARCHAR(45),
    target_entity   VARCHAR(100),
    target_id       BIGINT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id      ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action       ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at   ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_target       ON audit_logs(target_entity, target_id);

COMMENT ON TABLE  audit_logs             IS 'Immutable audit trail of all system actions';
COMMENT ON COLUMN audit_logs.user_id     IS 'NULL for anonymous login attempts';
COMMENT ON COLUMN audit_logs.action      IS 'e.g. LOGIN, CHECK_IN, EDIT_EMPLOYEE, CREATE_PROJECT';
COMMENT ON COLUMN audit_logs.target_entity IS 'Affected table name, e.g. attendance, users';
