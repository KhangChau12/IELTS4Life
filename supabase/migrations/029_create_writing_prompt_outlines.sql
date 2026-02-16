-- Migration: Create writing_prompt_outlines table
-- Stores AI-generated essay outlines per prompt (generated once, cached for reuse)

CREATE TABLE IF NOT EXISTS writing_prompt_outlines (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id    UUID NOT NULL REFERENCES writing_prompts(id) ON DELETE CASCADE,
  outline_1    TEXT NOT NULL,
  outline_2    TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT writing_prompt_outlines_prompt_id_unique UNIQUE (prompt_id)
);

CREATE INDEX IF NOT EXISTS idx_prompt_outlines_prompt_id
  ON writing_prompt_outlines(prompt_id);

-- RLS: anyone can read outlines (public content)
ALTER TABLE writing_prompt_outlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read outlines"
  ON writing_prompt_outlines
  FOR SELECT
  USING (true);

-- Only service role (server-side API) can insert/update outlines
CREATE POLICY "Service role can manage outlines"
  ON writing_prompt_outlines
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
