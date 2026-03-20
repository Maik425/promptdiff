-- Add auth_provider column to support Google OAuth alongside email/password auth.
-- Existing rows get 'email' as the default so nothing breaks.
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT NOT NULL DEFAULT 'email';
-- 'email' = password-based auth, 'google' = Google OAuth
