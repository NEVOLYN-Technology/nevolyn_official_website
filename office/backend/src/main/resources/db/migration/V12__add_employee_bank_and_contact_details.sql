-- ─────────────────────────────────────────────────────────────
-- V12 — Add email and bank account details to users table
--
-- Enables full employee profile & banking details storage for
-- payroll, reimbursement, and personnel directory management.
-- ─────────────────────────────────────────────────────────────

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email                VARCHAR(255),
    ADD COLUMN IF NOT EXISTS bank_name            VARCHAR(255),
    ADD COLUMN IF NOT EXISTS bank_account_name    VARCHAR(255),
    ADD COLUMN IF NOT EXISTS bank_account_number  VARCHAR(100),
    ADD COLUMN IF NOT EXISTS bank_branch          VARCHAR(255),
    ADD COLUMN IF NOT EXISTS bank_routing_number  VARCHAR(100);

COMMENT ON COLUMN users.email                IS 'Official or primary contact email address';
COMMENT ON COLUMN users.bank_name            IS 'Employee bank name for salary/payroll disbursement';
COMMENT ON COLUMN users.bank_account_name    IS 'Account holder name as registered with the bank';
COMMENT ON COLUMN users.bank_account_number  IS 'Bank account number / IBAN';
COMMENT ON COLUMN users.bank_branch          IS 'Bank branch name';
COMMENT ON COLUMN users.bank_routing_number  IS 'Bank routing / SWIFT code';

