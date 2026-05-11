-- Add subscription fields to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_status IN ('free', 'active', 'expired')),
  ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS subscription_order_code TEXT NULL;

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_code TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed')),
  sepay_transaction_id INTEGER NULL,
  transaction_content TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ NULL
);

-- RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role has full access implicitly (bypasses RLS)
