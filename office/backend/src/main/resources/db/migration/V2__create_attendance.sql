-- ─────────────────────────────────────────────────────────────
-- V2 — attendance table
-- Daily punch records and analytics
-- ─────────────────────────────────────────────────────────────

CREATE TABLE attendance (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date            DATE            NOT NULL,
    check_in_time   TIME,
    check_out_time  TIME,
    total_hours     NUMERIC(5, 2)   NOT NULL DEFAULT 0.00,
    late_status     VARCHAR(50)     NOT NULL DEFAULT 'On Time',
    early_checkout  VARCHAR(50)     NOT NULL DEFAULT 'No',
    status          VARCHAR(50)     NOT NULL DEFAULT 'Present',
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- One attendance record per employee per day
    CONSTRAINT uq_attendance_user_date UNIQUE (user_id, date)
);

CREATE INDEX idx_attendance_user_id ON attendance(user_id);
CREATE INDEX idx_attendance_date    ON attendance(date);
CREATE INDEX idx_attendance_status  ON attendance(status);

COMMENT ON TABLE  attendance                IS 'Daily punch-in/punch-out records with punctuality analysis';
COMMENT ON COLUMN attendance.late_status    IS 'On Time: check_in_time <= 12:00 | Late: check_in_time > 12:00';
COMMENT ON COLUMN attendance.early_checkout IS 'Yes: check_out_time < 17:00 | No: check_out_time >= 17:00';
COMMENT ON COLUMN attendance.total_hours    IS 'Calculated hours between check-in and check-out (max 2 decimal places)';
