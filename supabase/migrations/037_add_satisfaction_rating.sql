ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS satisfaction_rating int CHECK (satisfaction_rating BETWEEN 1 AND 4),
  ADD COLUMN IF NOT EXISTS satisfaction_rated_at timestamptz;
