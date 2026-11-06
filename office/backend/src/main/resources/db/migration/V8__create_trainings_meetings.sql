-- ─────────────────────────────────────────────────────────────
-- V8 — trainings_meetings table
-- Knowledge sharing and department sessions
-- ─────────────────────────────────────────────────────────────

CREATE TABLE trainings_meetings (
    id                  BIGSERIAL       PRIMARY KEY,
    title               VARCHAR(500)    NOT NULL,
    session_type        VARCHAR(50)     NOT NULL DEFAULT 'Training',
    session_date        DATE            NOT NULL,
    trainer_presenter   VARCHAR(255),
    participants        TEXT,
    duration_minutes    INTEGER         NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
    notes               TEXT,
    outcome             TEXT,
    remarks             TEXT,
    created_by          BIGINT          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trainings_meetings_session_date ON trainings_meetings(session_date);
CREATE INDEX idx_trainings_meetings_type         ON trainings_meetings(session_type);
CREATE INDEX idx_trainings_meetings_created_by   ON trainings_meetings(created_by);

COMMENT ON TABLE trainings_meetings IS 'Technical training sessions, department meetings, and reviews';
