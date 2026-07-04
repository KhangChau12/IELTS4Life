ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS weekly_report_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_report_sent_at timestamptz;
