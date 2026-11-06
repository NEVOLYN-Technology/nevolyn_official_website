-- ─────────────────────────────────────────────────────────────
-- V5 — experiments table
-- Scientific laboratory experiments
-- ─────────────────────────────────────────────────────────────

CREATE TABLE experiments (
    id              BIGSERIAL   PRIMARY KEY,
    project_id      BIGINT      NOT NULL REFERENCES rnd_projects(id) ON DELETE CASCADE,
    title           VARCHAR(500) NOT NULL,
    experiment_date DATE        NOT NULL,
    researcher_id   BIGINT      NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    objective       TEXT,
    procedure       TEXT,
    result          TEXT,
    observation     TEXT,
    conclusion      TEXT,
    remarks         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_experiments_project_id   ON experiments(project_id);
CREATE INDEX idx_experiments_researcher_id ON experiments(researcher_id);
CREATE INDEX idx_experiments_date         ON experiments(experiment_date);

COMMENT ON TABLE experiments IS 'Laboratory experiment records linked to R&D projects';
