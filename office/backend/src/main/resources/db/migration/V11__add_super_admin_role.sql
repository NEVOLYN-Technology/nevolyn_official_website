-- ─────────────────────────────────────────────────────────────
-- V11 — Introduce super_admin role
--
-- Adds support for the SUPER_ADMIN privilege tier.
-- Existing admin and employee accounts are UNCHANGED.
-- SUPER_ADMIN accounts are provisioned via AdminAccountInitializer
-- using SUPER_ADMIN_1_* and SUPER_ADMIN_2_* environment variables.
-- ─────────────────────────────────────────────────────────────

-- The role column is VARCHAR(50), so no enum type change is needed.
-- Simply update the comment to reflect the new three-tier model.
COMMENT ON COLUMN users.role IS
    'super_admin: system owner (max 2) | admin: office operations | employee: own data only';

-- ─────────────────────────────────────────────────────────────
-- Add index for super_admin role lookups (e.g. count enforcement)
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_super_admin ON users(role) WHERE role = 'super_admin';
