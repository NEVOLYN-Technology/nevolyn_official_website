-- ─────────────────────────────────────────────────────────────
-- V4 — tasks table
-- Actionable delegated tasks
-- ─────────────────────────────────────────────────────────────

CREATE TABLE tasks (
    id              BIGSERIAL       PRIMARY KEY,
    project_id      BIGINT          REFERENCES rnd_projects(id) ON DELETE SET NULL,
    title           VARCHAR(500)    NOT NULL,
    description     TEXT,
    assigned_to_id  BIGINT          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    start_date      DATE,
    deadline        DATE,
    priority        VARCHAR(50)     NOT NULL DEFAULT 'Medium',
    status          VARCHAR(50)     NOT NULL DEFAULT 'Pending',
    progress_pct    INTEGER         NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
    remarks         TEXT,
    created_by      BIGINT          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_assigned_to_id ON tasks(assigned_to_id);
CREATE INDEX idx_tasks_project_id     ON tasks(project_id);
CREATE INDEX idx_tasks_status         ON tasks(status);
CREATE INDEX idx_tasks_priority       ON tasks(priority);
CREATE INDEX idx_tasks_deadline       ON tasks(deadline);

COMMENT ON TABLE tasks IS 'Actionable tasks delegated to employees, optionally linked to R&D projects';
