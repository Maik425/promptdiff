CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    api_key TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE evals (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    prompt TEXT NOT NULL,
    input TEXT,
    models TEXT[] NOT NULL,
    options JSONB,
    results JSONB NOT NULL,
    meta JSONB,
    total_cost_usd NUMERIC(10,6) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usage (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    month TEXT NOT NULL,
    eval_count INT NOT NULL DEFAULT 0,
    total_cost_usd NUMERIC(10,6) NOT NULL DEFAULT 0,
    UNIQUE(user_id, month)
);

CREATE INDEX idx_evals_user_id ON evals(user_id);
CREATE INDEX idx_evals_created_at ON evals(created_at);
CREATE INDEX idx_usage_user_month ON usage(user_id, month);
