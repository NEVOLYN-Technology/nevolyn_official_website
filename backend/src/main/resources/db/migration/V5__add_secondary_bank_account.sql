-- =============================================================================
-- V5 — Add Secondary Bank Account columns to users table
-- Allows storing up to two bank accounts (Primary & Secondary) per employee
-- =============================================================================

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS secondary_bank_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS secondary_bank_account_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS secondary_bank_account_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS secondary_bank_branch VARCHAR(255),
    ADD COLUMN IF NOT EXISTS secondary_bank_routing_number VARCHAR(100);

