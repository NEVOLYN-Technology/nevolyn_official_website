-- ─────────────────────────────────────────────────────────────
-- V6 — development_records table
-- Product stage iteration records
-- ─────────────────────────────────────────────────────────────

CREATE TABLE development_records (
    id              BIGSERIAL       PRIMARY KEY,
    project_id      BIGINT          NOT NULL REFERENCES rnd_projects(id) ON DELETE CASCADE,
    product_name    VARCHAR(255)    NOT NULL,
    stage           VARCHAR(100)    NOT NULL,
    version         VARCHAR(50),
    record_date     DATE            NOT NULL,
    responsible_id  BIGINT          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    result          TEXT,
    issues          TEXT,
    next_action     TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_development_records_project_id    ON development_records(project_id);
CREATE INDEX idx_development_records_responsible_id ON development_records(responsible_id);
CREATE INDEX idx_development_records_record_date   ON development_records(record_date);

COMMENT ON TABLE  development_records       IS 'Product development stage trial records (Lab Dip, Pilot Trial, Bulk Sample)';
COMMENT ON COLUMN development_records.stage IS 'e.g. Lab Dip, Pilot Trial, Bulk Sample';
