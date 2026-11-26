-- =============================================================================
-- V3 - Sync acknowledged status for existing contact inquiries
--
-- Ensures contact inquiries that were previously acknowledged via email receipt
-- (is_acknowledged = true) have their status set to 'ACKNOWLEDGED'.
-- =============================================================================

UPDATE contact_inquiries
SET status = 'ACKNOWLEDGED'
WHERE is_acknowledged = TRUE
  AND status = 'NEW';
