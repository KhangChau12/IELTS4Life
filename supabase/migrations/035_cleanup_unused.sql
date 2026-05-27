-- Migration 035: Remove unused tables and columns
--
-- Tables removed:
--   1. token_usage       — INSERT-only, never queried anywhere in codebase
--   2. vocabulary_views  — UPSERT-only, never queried anywhere in codebase
--   3. quiz_results      — zombie table from initial design, replaced by vocabulary_quiz_attempts
--
-- Columns removed:
--   1. guest_fingerprints.last_used_at — written to on every guest mark, never read
--
-- To see size before/after: run supabase/scripts/035_size_report.sql in SQL Editor

DROP TABLE IF EXISTS token_usage;
DROP TABLE IF EXISTS vocabulary_views;
DROP TABLE IF EXISTS quiz_results;

ALTER TABLE guest_fingerprints DROP COLUMN IF EXISTS last_used_at;
