-- =============================================================================
-- V6 — Add photo_url column to users table
-- Allows employees to store and display their uploaded profile photo
-- =============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500);

