-- ─────────────────────────────────────────────────────────────
-- V7 — work_logs table
-- Employee daily work submissions
-- ─────────────────────────────────────────────────────────────

CREATE TABLE work_logs (
    id                BIGSERIAL       PRIMARY KEY,
    user_id           BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date          DATE            NOT NULL,
    work_completed    TEXT            NOT NULL,
    time_spent_hours  NUMERIC(4, 2)   NOT NULL DEFAULT 0.00,
    issues            TEXT,
    next_action       TEXT,
    remarks           TEXT,
    submitted_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- One work log per employee per day
    CONSTRAINT uq_work_logs_user_date UNIQUE (user_id, log_date)
);

CREATE INDEX idx_work_logs_user_id  ON work_logs(user_id);
CREATE INDEX idx_work_logs_log_date ON work_logs(log_date);

COMMENT ON TABLE work_logs IS 'Daily employee work log submissions reviewed by supervisors';
