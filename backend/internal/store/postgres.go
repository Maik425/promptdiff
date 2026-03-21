// Package store — PostgreSQL implementation of the Store interface.
package store

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/Maik425/promptdiff/internal/model"
	"github.com/lib/pq"
)

// PostgresStore implements Store using PostgreSQL via database/sql.
type PostgresStore struct {
	db *sql.DB
}

// NewPostgresStore opens a PostgreSQL connection pool and verifies connectivity.
func NewPostgresStore(dsn string) (*PostgresStore, error) {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("store: open db: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("store: ping db: %w", err)
	}

	return &PostgresStore{db: db}, nil
}

// Close implements Store.
func (s *PostgresStore) Close() error {
	return s.db.Close()
}

// CreateUser implements Store.
func (s *PostgresStore) CreateUser(ctx context.Context, u *model.User) error {
	provider := u.AuthProvider
	if provider == "" {
		provider = model.AuthProviderEmail
	}

	const q = `
		INSERT INTO users (id, email, password_hash, api_key, plan, created_at, auth_provider)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`

	// email_verified defaults to FALSE in the database (migration 004).
	_, err := s.db.ExecContext(ctx, q,
		u.ID, u.Email, u.PasswordHash, u.APIKey, string(u.Plan), u.CreatedAt, provider,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return fmt.Errorf("store: user already exists: %w", ErrConflict)
		}
		return fmt.Errorf("store: create user: %w", err)
	}
	return nil
}

// CreateOrGetOAuthUser implements Store.
// If a user with the given email already exists it is returned unchanged.
// Otherwise a new user row is inserted with auth_provider = 'google'.
func (s *PostgresStore) CreateOrGetOAuthUser(ctx context.Context, u *model.User) (*model.User, error) {
	// Try to create first. If the email already exists, fall through to a lookup.
	const insert = `
		INSERT INTO users (id, email, password_hash, api_key, plan, created_at, auth_provider)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (email) DO NOTHING`

	result, err := s.db.ExecContext(ctx, insert,
		u.ID, u.Email, u.PasswordHash, u.APIKey, string(u.Plan), u.CreatedAt, u.AuthProvider,
	)
	if err != nil {
		return nil, fmt.Errorf("store: create oauth user: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("store: create oauth user rows affected: %w", err)
	}

	if rows == 1 {
		// New user was created — return as-is.
		return u, nil
	}

	// Existing user — look them up by email.
	existing, err := s.GetUserByEmail(ctx, u.Email)
	if err != nil {
		return nil, fmt.Errorf("store: get existing oauth user: %w", err)
	}
	return existing, nil
}

// GetUserByEmail implements Store.
func (s *PostgresStore) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	const q = `
		SELECT id, email, password_hash, api_key, plan, created_at,
			COALESCE(stripe_customer_id, ''), COALESCE(has_payment_method, false), COALESCE(monthly_spend_limit_usd, 50),
			COALESCE(auth_provider, 'email'), COALESCE(email_verified, false)
		FROM users WHERE email = $1`

	u := &model.User{}
	err := s.db.QueryRowContext(ctx, q, email).Scan(
		&u.ID, &u.Email, &u.PasswordHash, &u.APIKey, &u.Plan, &u.CreatedAt,
		&u.StripeCustomerID, &u.HasPaymentMethod, &u.MonthlySpendLimit,
		&u.AuthProvider, &u.EmailVerified,
	)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("store: get user by email: %w", err)
	}
	return u, nil
}

// GetUserByAPIKey implements Store.
func (s *PostgresStore) GetUserByAPIKey(ctx context.Context, apiKey string) (*model.User, error) {
	const q = `
		SELECT id, email, password_hash, api_key, plan, created_at,
			COALESCE(stripe_customer_id, ''), COALESCE(has_payment_method, false), COALESCE(monthly_spend_limit_usd, 50),
			COALESCE(auth_provider, 'email'), COALESCE(email_verified, false)
		FROM users WHERE api_key = $1`

	u := &model.User{}
	err := s.db.QueryRowContext(ctx, q, apiKey).Scan(
		&u.ID, &u.Email, &u.PasswordHash, &u.APIKey, &u.Plan, &u.CreatedAt,
		&u.StripeCustomerID, &u.HasPaymentMethod, &u.MonthlySpendLimit,
		&u.AuthProvider, &u.EmailVerified,
	)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("store: get user by api key: %w", err)
	}
	return u, nil
}

// CreateEval implements Store.
func (s *PostgresStore) CreateEval(ctx context.Context, e *model.Eval) error {
	resultsJSON, err := json.Marshal(e.Results)
	if err != nil {
		return fmt.Errorf("store: marshal results: %w", err)
	}

	var metaJSON []byte
	if e.Meta != nil {
		metaJSON, err = json.Marshal(e.Meta)
		if err != nil {
			return fmt.Errorf("store: marshal meta: %w", err)
		}
	}

	var optionsJSON []byte
	if e.Options != nil {
		optionsJSON, err = json.Marshal(e.Options)
		if err != nil {
			return fmt.Errorf("store: marshal options: %w", err)
		}
	}

	const q = `
		INSERT INTO evals (id, user_id, prompt, input, models, options, results, meta, total_cost_usd, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`

	_, err = s.db.ExecContext(ctx, q,
		e.ID,
		e.UserID,
		e.Prompt,
		e.Input,
		pq.Array(e.Models),
		nullableJSON(optionsJSON),
		resultsJSON,
		nullableJSON(metaJSON),
		e.TotalCostUSD,
		e.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("store: create eval: %w", err)
	}
	return nil
}

// GetEval implements Store.
func (s *PostgresStore) GetEval(ctx context.Context, id, userID string) (*model.Eval, error) {
	const q = `
		SELECT id, user_id, prompt, input, models, options, results, meta, total_cost_usd, created_at
		FROM evals WHERE id = $1 AND user_id = $2`

	e := &model.Eval{}
	var resultsJSON, metaJSON, optionsJSON []byte
	var input sql.NullString

	err := s.db.QueryRowContext(ctx, q, id, userID).Scan(
		&e.ID,
		&e.UserID,
		&e.Prompt,
		&input,
		pq.Array(&e.Models),
		&optionsJSON,
		&resultsJSON,
		&metaJSON,
		&e.TotalCostUSD,
		&e.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("store: get eval: %w", err)
	}

	if input.Valid {
		e.Input = input.String
	}

	if err := json.Unmarshal(resultsJSON, &e.Results); err != nil {
		return nil, fmt.Errorf("store: unmarshal results: %w", err)
	}
	if len(metaJSON) > 0 {
		e.Meta = &model.EvalMeta{}
		if err := json.Unmarshal(metaJSON, e.Meta); err != nil {
			return nil, fmt.Errorf("store: unmarshal meta: %w", err)
		}
	}
	if len(optionsJSON) > 0 {
		e.Options = &model.EvalOptions{}
		if err := json.Unmarshal(optionsJSON, e.Options); err != nil {
			return nil, fmt.Errorf("store: unmarshal options: %w", err)
		}
	}

	return e, nil
}

// ListEvals implements Store.
func (s *PostgresStore) ListEvals(ctx context.Context, userID string, limit, offset int) ([]model.Eval, error) {
	const q = `
		SELECT id, user_id, prompt, input, models, options, results, meta, total_cost_usd, created_at
		FROM evals WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := s.db.QueryContext(ctx, q, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("store: list evals: %w", err)
	}
	defer rows.Close()

	var evals []model.Eval
	for rows.Next() {
		var e model.Eval
		var resultsJSON, metaJSON, optionsJSON []byte
		var input sql.NullString

		if err := rows.Scan(
			&e.ID,
			&e.UserID,
			&e.Prompt,
			&input,
			pq.Array(&e.Models),
			&optionsJSON,
			&resultsJSON,
			&metaJSON,
			&e.TotalCostUSD,
			&e.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("store: scan eval row: %w", err)
		}

		if input.Valid {
			e.Input = input.String
		}

		if err := json.Unmarshal(resultsJSON, &e.Results); err != nil {
			return nil, fmt.Errorf("store: unmarshal results: %w", err)
		}
		if len(metaJSON) > 0 {
			e.Meta = &model.EvalMeta{}
			if err := json.Unmarshal(metaJSON, e.Meta); err != nil {
				return nil, fmt.Errorf("store: unmarshal meta: %w", err)
			}
		}
		if len(optionsJSON) > 0 {
			e.Options = &model.EvalOptions{}
			if err := json.Unmarshal(optionsJSON, e.Options); err != nil {
				return nil, fmt.Errorf("store: unmarshal options: %w", err)
			}
		}

		evals = append(evals, e)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("store: list evals rows: %w", err)
	}

	return evals, nil
}

// GetUsage implements Store.
func (s *PostgresStore) GetUsage(ctx context.Context, userID, month string) (*model.Usage, error) {
	const q = `
		SELECT user_id, month, eval_count, total_cost_usd
		FROM usage WHERE user_id = $1 AND month = $2`

	u := &model.Usage{}
	err := s.db.QueryRowContext(ctx, q, userID, month).Scan(
		&u.UserID, &u.Month, &u.EvalCount, &u.TotalCostUSD,
	)
	if err == sql.ErrNoRows {
		// Return a zeroed record if none exists yet.
		return &model.Usage{UserID: userID, Month: month}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("store: get usage: %w", err)
	}
	return u, nil
}

// UpsertUsage implements Store.
func (s *PostgresStore) UpsertUsage(ctx context.Context, userID, month string, evalDelta int, costDelta float64) error {
	const q = `
		INSERT INTO usage (user_id, month, eval_count, total_cost_usd)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (user_id, month) DO UPDATE
		SET eval_count    = usage.eval_count + EXCLUDED.eval_count,
		    total_cost_usd = usage.total_cost_usd + EXCLUDED.total_cost_usd`

	_, err := s.db.ExecContext(ctx, q, userID, month, evalDelta, costDelta)
	if err != nil {
		return fmt.Errorf("store: upsert usage: %w", err)
	}
	return nil
}

// GetUserByID implements Store.
func (s *PostgresStore) GetUserByID(ctx context.Context, id string) (*model.User, error) {
	const q = `
		SELECT id, email, password_hash, api_key, plan, created_at,
			COALESCE(stripe_customer_id, ''), COALESCE(has_payment_method, false), COALESCE(monthly_spend_limit_usd, 50),
			COALESCE(auth_provider, 'email'), COALESCE(email_verified, false)
		FROM users WHERE id = $1`

	u := &model.User{}
	err := s.db.QueryRowContext(ctx, q, id).Scan(
		&u.ID, &u.Email, &u.PasswordHash, &u.APIKey, &u.Plan, &u.CreatedAt,
		&u.StripeCustomerID, &u.HasPaymentMethod, &u.MonthlySpendLimit,
		&u.AuthProvider, &u.EmailVerified,
	)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("store: get user by id: %w", err)
	}
	return u, nil
}

// GetUserByStripeCustomerID implements Store.
func (s *PostgresStore) GetUserByStripeCustomerID(ctx context.Context, stripeCustomerID string) (*model.User, error) {
	const q = `
		SELECT id, email, password_hash, api_key, plan, created_at,
			COALESCE(stripe_customer_id, ''), COALESCE(has_payment_method, false), COALESCE(monthly_spend_limit_usd, 50),
			COALESCE(auth_provider, 'email'), COALESCE(email_verified, false)
		FROM users WHERE stripe_customer_id = $1`

	u := &model.User{}
	err := s.db.QueryRowContext(ctx, q, stripeCustomerID).Scan(
		&u.ID, &u.Email, &u.PasswordHash, &u.APIKey, &u.Plan, &u.CreatedAt,
		&u.StripeCustomerID, &u.HasPaymentMethod, &u.MonthlySpendLimit,
		&u.AuthProvider, &u.EmailVerified,
	)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("store: get user by stripe customer id: %w", err)
	}
	return u, nil
}

// UpdateStripeCustomer sets the stripe_customer_id for a user.
func (s *PostgresStore) UpdateStripeCustomer(ctx context.Context, userID, stripeCustomerID string) error {
	const q = `UPDATE users SET stripe_customer_id = $1 WHERE id = $2`
	_, err := s.db.ExecContext(ctx, q, stripeCustomerID, userID)
	if err != nil {
		return fmt.Errorf("store: update stripe customer: %w", err)
	}
	return nil
}

// SetPaymentMethod updates has_payment_method for a user.
func (s *PostgresStore) SetPaymentMethod(ctx context.Context, userID string, hasPaymentMethod bool) error {
	const q = `UPDATE users SET has_payment_method = $1 WHERE id = $2`
	_, err := s.db.ExecContext(ctx, q, hasPaymentMethod, userID)
	if err != nil {
		return fmt.Errorf("store: set payment method: %w", err)
	}
	return nil
}

// UpdateSpendLimit implements Store.
func (s *PostgresStore) UpdateSpendLimit(ctx context.Context, userID string, limit float64) error {
	const q = `UPDATE users SET monthly_spend_limit_usd = $1 WHERE id = $2`
	_, err := s.db.ExecContext(ctx, q, limit, userID)
	if err != nil {
		return fmt.Errorf("store: update spend limit: %w", err)
	}
	return nil
}

// UpdatePassword implements Store.
func (s *PostgresStore) UpdatePassword(ctx context.Context, userID string, passwordHash string) error {
	const q = `UPDATE users SET password_hash = $1 WHERE id = $2`
	_, err := s.db.ExecContext(ctx, q, passwordHash, userID)
	if err != nil {
		return fmt.Errorf("store: update password: %w", err)
	}
	return nil
}

// RegenerateAPIKey implements Store.
func (s *PostgresStore) RegenerateAPIKey(ctx context.Context, userID string, newKey string) error {
	const q = `UPDATE users SET api_key = $1 WHERE id = $2`
	_, err := s.db.ExecContext(ctx, q, newKey, userID)
	if err != nil {
		return fmt.Errorf("store: regenerate api key: %w", err)
	}
	return nil
}

// DeleteUser implements Store.
// It deletes all user-owned records then removes the user row, all within a
// single transaction so the operation is atomic.
func (s *PostgresStore) DeleteUser(ctx context.Context, userID string) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("store: delete user begin tx: %w", err)
	}
	defer tx.Rollback() //nolint:errcheck

	tables := []string{"evals", "usage", "billing_events", "invoices"}
	for _, t := range tables {
		if _, err := tx.ExecContext(ctx, `DELETE FROM `+t+` WHERE user_id = $1`, userID); err != nil {
			return fmt.Errorf("store: delete user data from %s: %w", t, err)
		}
	}

	if _, err := tx.ExecContext(ctx, `DELETE FROM users WHERE id = $1`, userID); err != nil {
		return fmt.Errorf("store: delete user row: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("store: delete user commit: %w", err)
	}
	return nil
}

// isUniqueViolation returns true when err is a PostgreSQL unique constraint error.
func isUniqueViolation(err error) bool {
	if pqErr, ok := err.(*pq.Error); ok {
		return pqErr.Code == "23505"
	}
	return false
}

// nullableJSON returns nil when b is empty, otherwise the raw bytes.
func nullableJSON(b []byte) interface{} {
	if len(b) == 0 {
		return nil
	}
	return b
}

// Sentinel errors returned by the store layer.
var (
	ErrNotFound = fmt.Errorf("not found")
	ErrConflict = fmt.Errorf("conflict")
)
