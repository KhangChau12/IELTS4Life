-- Migration: Add prompt_id FK to essays table
-- This links essays submitted from the prompt-based writing flow to specific prompts

ALTER TABLE essays
  ADD COLUMN IF NOT EXISTS prompt_id UUID
    REFERENCES writing_prompts(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_essays_prompt_id ON essays(prompt_id);
CREATE INDEX IF NOT EXISTS idx_essays_user_prompt ON essays(user_id, prompt_id)
  WHERE prompt_id IS NOT NULL;
