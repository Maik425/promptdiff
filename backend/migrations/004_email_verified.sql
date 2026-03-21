-- Migration 004: add email_verified column and rehash API keys.
--
-- Finding 9.1/9.2: unverified accounts now receive a reduced free quota (20
-- instead of 100 evals/month) to limit abuse without requiring email
-- infrastructure.  Set email_verified = true for existing accounts so that
-- current users are not suddenly downgraded.
--
-- Finding 1.1: API keys are now stored as SHA-256 hashes. Existing plaintext
-- keys will stop working after deploying the new binary. Run the one-off rehash
-- script (scripts/rehash_api_keys.go) BEFORE deploying to rehash existing rows.

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Treat existing rows as verified so they retain the full 100-eval free quota.
UPDATE users SET email_verified = TRUE WHERE email_verified = FALSE;
