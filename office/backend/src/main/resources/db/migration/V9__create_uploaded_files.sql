-- ─────────────────────────────────────────────────────────────
-- V9 — uploaded_files table
-- File attachments for projects and tasks
-- ─────────────────────────────────────────────────────────────

CREATE TABLE uploaded_files (
    id                BIGSERIAL           PRIMARY KEY,
    entity_type       VARCHAR(50)         NOT NULL,
    entity_id         BIGINT              NOT NULL,
    original_filename VARCHAR(500)        NOT NULL,
    stored_filename   VARCHAR(500)        NOT NULL,
    file_path         TEXT                NOT NULL,
    file_size         BIGINT              NOT NULL CHECK (file_size > 0),
    mime_type         VARCHAR(200),
    uploaded_by       BIGINT              NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    uploaded_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_uploaded_files_entity ON uploaded_files(entity_type, entity_id);
CREATE INDEX idx_uploaded_files_uploader ON uploaded_files(uploaded_by);

COMMENT ON TABLE  uploaded_files                IS 'File attachments linked to projects or tasks';
COMMENT ON COLUMN uploaded_files.entity_type    IS 'project or task — the parent entity type';
COMMENT ON COLUMN uploaded_files.stored_filename IS 'UUID-prefixed filename stored on disk/cloud';
COMMENT ON COLUMN uploaded_files.file_path      IS 'Local disk path OR Supabase Storage URL';
