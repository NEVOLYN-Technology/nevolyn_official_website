-- ─────────────────────────────────────────────────────────────
-- V3 — rnd_projects table
-- Research & Development project portfolio
-- ─────────────────────────────────────────────────────────────

CREATE TABLE rnd_projects (
    id              BIGSERIAL       PRIMARY KEY,
    code            VARCHAR(50)     NOT NULL UNIQUE,
    name            VARCHAR(255)    NOT NULL,
    objective       TEXT,
    description     TEXT,
    responsible_id  BIGINT          REFERENCES users(id) ON DELETE SET NULL,
    start_date      DATE,
    target_date     DATE,
    status          VARCHAR(50)     NOT NULL DEFAULT 'Pending',
    progress_pct    INTEGER         NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
    remarks         TEXT,
    created_by      BIGINT          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rnd_projects_status  ON rnd_projects(status);
CREATE INDEX idx_rnd_projects_code    ON rnd_projects(code);

COMMENT ON TABLE  rnd_projects              IS 'R&D project portfolio — Nevolyn research initiatives';
COMMENT ON COLUMN rnd_projects.code         IS 'Project code, e.g. PRJ-001';
COMMENT ON COLUMN rnd_projects.progress_pct IS 'Completion percentage: 0 to 100';
