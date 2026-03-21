// Package store defines the database interface used by the application.
package store

import (
	"context"

	"github.com/Maik425/promptdiff/internal/model"
)

// Store is the interface for all database operations.
type Store interface {
	// User operations
	CreateUser(ctx context.Context, user *model.User) error
	GetUserByEmail(ctx context.Context, email string) (*model.User, error)
	GetUserByAPIKey(ctx context.Context, apiKey string) (*model.User, error)
	// CreateOrGetOAuthUser creates a new user from a Google OAuth login or returns
	// the existing user if the email is already registered. When the user already
	// exists the auth_provider is NOT changed (email users can also log in via OAuth).
	CreateOrGetOAuthUser(ctx context.Context, user *model.User) (*model.User, error)

	// Eval operations
	CreateEval(ctx context.Context, eval *model.Eval) error
	GetEval(ctx context.Context, id string, userID string) (*model.Eval, error)
	ListEvals(ctx context.Context, userID string, limit, offset int) ([]model.Eval, error)

	// Usage operations
	GetUsage(ctx context.Context, userID string, month string) (*model.Usage, error)
	UpsertUsage(ctx context.Context, userID string, month string, evalDelta int, costDelta float64) error

	// Billing operations
	GetUserByID(ctx context.Context, id string) (*model.User, error)
	GetUserByStripeCustomerID(ctx context.Context, stripeCustomerID string) (*model.User, error)
	UpdateStripeCustomer(ctx context.Context, userID, stripeCustomerID string) error
	SetPaymentMethod(ctx context.Context, userID string, hasPaymentMethod bool) error

	// Settings operations
	UpdateSpendLimit(ctx context.Context, userID string, limit float64) error
	UpdatePassword(ctx context.Context, userID string, passwordHash string) error
	RegenerateAPIKey(ctx context.Context, userID string, newKey string) error
	DeleteUser(ctx context.Context, userID string) error

	// Admin operations
	ListAllUsers(ctx context.Context) ([]model.UserSummary, error)
	SetEmailVerified(ctx context.Context, userID string, verified bool) error
	UpdatePlan(ctx context.Context, userID string, plan string) error
	GetGlobalUsage(ctx context.Context) (*model.GlobalUsage, error)

	// Close releases the database connection pool.
	Close() error
}
