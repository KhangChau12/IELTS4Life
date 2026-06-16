-- Merge mixed_hybrid into two_part_question
-- These two question types are functionally identical (both ask two separate questions).
-- We keep two_part_question as the canonical value.

-- 1. Update writing_prompts rows
UPDATE writing_prompts
SET question_type = 'two_part_question'
WHERE question_type = 'mixed_hybrid';

-- 2. Update denormalised field on essays
UPDATE essays
SET essay_question_type = 'two_part_question'
WHERE essay_question_type = 'mixed_hybrid';

-- Note: the 'mixed_hybrid' value still exists in the writing_question_type enum.
-- PostgreSQL does not support DROP VALUE on an enum, so we leave it in the enum
-- but no rows will reference it after this migration.
