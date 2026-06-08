-- ============================================================
-- Prompt Classification Feature (migrations 038–042 combined)
-- ============================================================
-- Adds user-submitted prompt classification pipeline:
--   1. writing_prompts gets status/source/dedup fields
--   2. essays gets prompt_classification_status + denormalized topic fields
--   3. RLS policies for admin review queue
-- ============================================================

-- ── writing_prompts ─────────────────────────────────────────

-- Allow user-submitted prompts to have no created_by (null = AI-submitted)
ALTER TABLE writing_prompts
  ALTER COLUMN created_by DROP NOT NULL;

-- Classification & dedup fields
ALTER TABLE writing_prompts
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved'
    CHECK (status IN ('approved', 'pending')),
  ADD COLUMN IF NOT EXISTS normalized_text text,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'user_submission')),
  ADD COLUMN IF NOT EXISTS submitted_count int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS classification_confidence float;

-- Backfill: all existing prompts are approved + manual
UPDATE writing_prompts
  SET status = 'approved', source = 'manual'
  WHERE status IS NULL OR source IS NULL;

-- Unique index for dedup (only when normalized_text is set)
CREATE UNIQUE INDEX IF NOT EXISTS writing_prompts_normalized_text_idx
  ON writing_prompts (normalized_text)
  WHERE normalized_text IS NOT NULL;

-- Index for pending review queue
CREATE INDEX IF NOT EXISTS writing_prompts_status_idx
  ON writing_prompts (status)
  WHERE status = 'pending';

-- ── essays ───────────────────────────────────────────────────

-- Classification status: tracks where each essay is in the pipeline
--   unclassified → essay exists but classify never ran (old essays, triggers on view)
--   pending      → classify fired, waiting for AI response
--   classified   → AI matched a topic + question_type
--   invalid      → AI determined this is not a Task 2 IELTS prompt
ALTER TABLE essays
  ADD COLUMN IF NOT EXISTS prompt_classification_status text NOT NULL DEFAULT 'unclassified'
    CHECK (prompt_classification_status IN ('pending', 'classified', 'invalid', 'unclassified'));

-- Backfill:
--   prompt_id IS NOT NULL → already classified (submitted from /write)
--   prompt_id IS NULL     → unclassified (pasted essay, classify on demand)
UPDATE essays
  SET prompt_classification_status = CASE
    WHEN prompt_id IS NOT NULL THEN 'classified'
    ELSE 'unclassified'
  END;

-- Denormalized classification fields — stored directly on essays so the
-- "Practice Similar Prompts" feature works even if the pending prompt is
-- later rejected/deleted by admin.
ALTER TABLE essays
  ADD COLUMN IF NOT EXISTS essay_topic_id uuid REFERENCES prompt_topics(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS essay_question_type text,
  ADD COLUMN IF NOT EXISTS essay_topic_name text;

-- Backfill: copy topic/type from the linked prompt for already-classified essays
UPDATE essays e
  SET
    essay_topic_id      = wp.topic_id,
    essay_question_type = wp.question_type,
    essay_topic_name    = pt.name
  FROM writing_prompts wp
  LEFT JOIN prompt_topics pt ON pt.id = wp.topic_id
  WHERE e.prompt_id = wp.id
    AND e.prompt_classification_status = 'classified'
    AND e.essay_topic_id IS NULL;

-- Index for status lookups (pending + unclassified are the "needs work" states)
DROP INDEX IF EXISTS essays_classification_status_idx;
CREATE INDEX IF NOT EXISTS essays_classification_status_idx
  ON essays (prompt_classification_status)
  WHERE prompt_classification_status IN ('pending', 'unclassified');

-- ── RLS policies for writing_prompts ────────────────────────

-- Tighten read: authenticated users only see approved prompts
DROP POLICY IF EXISTS "Authenticated users can view prompts" ON writing_prompts;
DROP POLICY IF EXISTS "Authenticated users can view approved prompts" ON writing_prompts;
DROP POLICY IF EXISTS "Guests can view approved prompts" ON writing_prompts;
DROP POLICY IF EXISTS "Anyone can view approved prompts" ON writing_prompts;
DROP POLICY IF EXISTS "Admins can view all prompts" ON writing_prompts;
DROP POLICY IF EXISTS "Admins can insert prompts" ON writing_prompts;
DROP POLICY IF EXISTS "Admins can update prompts" ON writing_prompts;
DROP POLICY IF EXISTS "Admins can delete prompts" ON writing_prompts;

-- Anyone (including guests) can read approved prompts
CREATE POLICY "Anyone can view approved prompts" ON writing_prompts
  FOR SELECT USING (status = 'approved');

-- Admins and devs can read ALL prompts (including pending review queue)
CREATE POLICY "Admins can view all prompts" ON writing_prompts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'dev')
    )
  );

-- Admins and devs can insert (create prompts manually in admin UI)
CREATE POLICY "Admins can insert prompts" ON writing_prompts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'dev')
    )
  );

-- Admins and devs can update (approve = status→'approved', edit classification)
-- NOTE: approve/reject API routes use service role to bypass this for reliability
CREATE POLICY "Admins can update prompts" ON writing_prompts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'dev')
    )
  );

-- Admins and devs can delete (reject = hard delete pending prompt)
CREATE POLICY "Admins can delete prompts" ON writing_prompts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'dev')
    )
  );
