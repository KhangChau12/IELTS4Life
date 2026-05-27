-- Migration 037: Fix handle_new_user trigger to prevent silent failures
--
-- Problem: Original trigger uses plain INSERT without ON CONFLICT.
-- If the auth callback also tries to INSERT a profile (race condition),
-- the second INSERT fails on the email UNIQUE constraint → silent error → orphaned auth record.
--
-- Fix: Use ON CONFLICT (id) DO NOTHING so the trigger is idempotent.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
