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

	// Eval operations
	CreateEval(ctx context.Context, eval *model.Eval) error
	GetEval(ctx context.Context, id string, userID string) (*model.Eval, error)
	ListEvals(ctx context.Context, userID string, limit, offset int) ([]model.Eval, error)

	// Usage operations
	GetUsage(ctx context.Context, userID string, month string) (*model.Usage, error)
	UpsertUsage(ctx context.Context, userID string, month string, evalDelta int, costDelta float64) error

	// Close releases the database connection pool.
	Close() error
}
