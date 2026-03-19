-- Billing support for hybrid pricing model
-- Free: 100 evals/month (no card)
-- Pay-as-you-go: $0.005/eval after card registered
-- Volume discounts at 5K and 25K

ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_payment_method BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_spend_limit_usd NUMERIC(10,2) DEFAULT 50.00;

-- Track individual eval charges for billing
CREATE TABLE IF NOT EXISTS billing_events (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    eval_id TEXT NOT NULL,
    eval_count INT NOT NULL DEFAULT 1,
    amount_usd NUMERIC(10,6) NOT NULL,
    pricing_tier TEXT NOT NULL,  -- 'free', 'standard', 'volume_5k', 'volume_25k'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_events_user_id ON billing_events(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_created_at ON billing_events(created_at);

-- Monthly invoice summary (populated by cron or on-demand)
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    month TEXT NOT NULL,  -- "2026-03"
    total_evals INT NOT NULL DEFAULT 0,
    total_amount_usd NUMERIC(10,6) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',  -- pending, paid, failed
    stripe_invoice_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, month)
);
