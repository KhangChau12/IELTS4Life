-- Migration: Create essay_drafts table
-- Stores user drafts for prompt-based writing (auto-saved, includes timer state)

CREATE TABLE IF NOT EXISTS essay_drafts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id      UUID NOT NULL REFERENCES writing_prompts(id) ON DELETE CASCADE,
  draft_content  TEXT NOT NULL DEFAULT '',
  timer_seconds  INTEGER NOT NULL DEFAULT 0,
  last_saved_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT essay_drafts_user_prompt_unique UNIQUE (user_id, prompt_id)
);

CREATE INDEX IF NOT EXISTS idx_essay_drafts_user_id   ON essay_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_essay_drafts_prompt_id ON essay_drafts(prompt_id);

-- RLS: users can only see and edit their own drafts
ALTER TABLE essay_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own drafts"
  ON essay_drafts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
