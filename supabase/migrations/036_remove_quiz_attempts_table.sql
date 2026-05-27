-- Migration 036: Remove vocabulary_quiz_attempts table, aggregate stats into profiles
--
-- Rationale: vocabulary_quiz_attempts was only used for aggregate stats (total attempts,
-- avg score). No feature requires viewing individual attempt history. Storing per-row
-- attempts is wasteful — we pre-aggregate into 3 counter columns on profiles instead.
--
-- Steps:
--   1. Add 3 counter columns to profiles
--   2. Backfill from existing vocabulary_quiz_attempts data
--   3. DROP vocabulary_quiz_attempts table

-- 1. Add quiz aggregate columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS quiz_total_attempts   int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quiz_total_correct     int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quiz_total_questions   int NOT NULL DEFAULT 0;

COMMENT ON COLUMN profiles.quiz_total_attempts  IS 'Cumulative number of vocabulary quizzes taken';
COMMENT ON COLUMN profiles.quiz_total_correct   IS 'Cumulative number of correct answers across all quizzes';
COMMENT ON COLUMN profiles.quiz_total_questions IS 'Cumulative number of questions answered across all quizzes';

-- 2. Backfill from existing data (safe: users with no attempts stay at 0)
UPDATE profiles p
SET
  quiz_total_attempts  = agg.attempts,
  quiz_total_correct   = agg.correct,
  quiz_total_questions = agg.questions
FROM (
  SELECT
    user_id,
    COUNT(*)::int             AS attempts,
    SUM(score)::int           AS correct,
    SUM(total_questions)::int AS questions
  FROM vocabulary_quiz_attempts
  WHERE user_id IS NOT NULL
  GROUP BY user_id
) agg
WHERE p.id = agg.user_id;

-- 3. Drop the now-redundant table
DROP TABLE IF EXISTS vocabulary_quiz_attempts;
