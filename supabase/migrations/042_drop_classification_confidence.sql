-- classification_confidence was stored per-prompt but not meaningful enough to surface in UI.
-- Admin review page no longer displays it; AI prompt no longer returns it.
ALTER TABLE writing_prompts
  DROP COLUMN IF EXISTS classification_confidence;
