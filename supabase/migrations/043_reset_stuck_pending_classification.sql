-- Reset essays stuck at 'pending' classification back to 'unclassified'.
-- These were left in 'pending' state by failed/killed serverless classify invocations.
-- PromptContextZone will detect 'unclassified' on next page load and retry.
UPDATE essays
  SET prompt_classification_status = 'unclassified'
  WHERE prompt_classification_status = 'pending';
