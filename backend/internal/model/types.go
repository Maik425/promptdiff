// Package model contains shared types used across the application.
package model

import "time"

// Plan represents a user's subscription plan.
type Plan string

const (
	PlanFree  Plan = "free"
	PlanPro   Plan = "pro"
	PlanScale Plan = "scale"
)

// AuthProviderEmail is the default auth provider (email + password).
const AuthProviderEmail = "email"

// AuthProviderGoogle indicates the user signed up via Google OAuth.
const AuthProviderGoogle = "google"

// User represents a registered user.
type User struct {
	ID                string    `json:"id"`
	Email             string    `json:"email"`
	PasswordHash      string    `json:"-"`
	APIKey            string    `json:"api_key"`
	Plan              Plan      `json:"plan"`
	CreatedAt         time.Time `json:"created_at"`
	StripeCustomerID  string    `json:"-"`
	HasPaymentMethod  bool      `json:"has_payment_method"`
	MonthlySpendLimit float64   `json:"monthly_spend_limit_usd"`
	// AuthProvider is "email" for password auth and "google" for Google OAuth.
	// It may be empty for rows created before migration 003.
	AuthProvider  string `json:"auth_provider,omitempty"`
	GoogleLinked  bool   `json:"google_linked"`
	EmailVerified bool   `json:"email_verified"`
}

// TokenUsage holds token counts for a completion.
type TokenUsage struct {
	Input  int `json:"input"`
	Output int `json:"output"`
	Total  int `json:"total"`
}

// EvalResult holds the outcome of running a single model.
type EvalResult struct {
	Model     string     `json:"model"`
	Provider  string     `json:"provider"`
	Output    string     `json:"output"`
	LatencyMs int64      `json:"latency_ms"`
	Tokens    TokenUsage `json:"tokens"`
	CostUSD   float64    `json:"cost_usd"`
	Error     string     `json:"error,omitempty"`
}

// EvalMeta holds aggregate metadata computed after all results are collected.
type EvalMeta struct {
	TotalCostUSD   float64 `json:"total_cost_usd"`
	UserChargeUSD  float64 `json:"user_charge_usd"`
	FastestModel   string  `json:"fastest_model"`
	CheapestModel  string  `json:"cheapest_model"`
}

// EvalOptions holds optional parameters for a comparison run.
type EvalOptions struct {
	Temperature float64 `json:"temperature"`
	MaxTokens   int     `json:"max_tokens"`
}

// Eval represents a stored evaluation record.
type Eval struct {
	ID          string       `json:"id"`
	UserID      string       `json:"user_id"`
	Prompt      string       `json:"prompt"`
	Input       string       `json:"input,omitempty"`
	Models      []string     `json:"models"`
	Options     *EvalOptions `json:"options,omitempty"`
	Results     []EvalResult `json:"results"`
	Meta        *EvalMeta    `json:"meta,omitempty"`
	TotalCostUSD float64     `json:"total_cost_usd"`
	CreatedAt   time.Time    `json:"created_at"`
}

// Usage holds aggregated usage stats for a user in a given month.
type Usage struct {
	UserID       string  `json:"user_id"`
	Month        string  `json:"month"`
	EvalCount    int     `json:"eval_count"`
	TotalCostUSD float64 `json:"total_cost_usd"`
}

// QuotaLimit returns the monthly eval limit for a plan.
func (p Plan) QuotaLimit() int {
	switch p {
	case PlanPro:
		return 5000
	case PlanScale:
		return 25000
	default:
		return 100
	}
}

// CompareRequest is the JSON body for POST /v1/compare.
type CompareRequest struct {
	Prompt  string       `json:"prompt"`
	Input   string       `json:"input,omitempty"`
	Models  []string     `json:"models"`
	Options *EvalOptions `json:"options,omitempty"`
}

// CompareResponse is the JSON response for POST /v1/compare.
type CompareResponse struct {
	EvalID  string       `json:"eval_id"`
	Results []EvalResult `json:"results"`
	Meta    *EvalMeta    `json:"meta"`
}

// SignupRequest is the JSON body for POST /v1/auth/signup.
type SignupRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// SignupResponse is returned after a successful signup.
type SignupResponse struct {
	UserID string `json:"user_id"`
	APIKey string `json:"api_key"`
	Token  string `json:"token"`
}

// LoginRequest is the JSON body for POST /v1/auth/login.
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse is returned after a successful login.
type LoginResponse struct {
	Token string `json:"token"`
}

// UserSummary is a lightweight user record for admin views.
type UserSummary struct {
	ID               string  `json:"id"`
	Email            string  `json:"email"`
	Plan             string  `json:"plan"`
	AuthProvider     string  `json:"auth_provider"`
	EmailVerified    bool    `json:"email_verified"`
	HasPaymentMethod bool    `json:"has_payment_method"`
	EvalCount        int     `json:"eval_count"`
	TotalCostUSD     float64 `json:"total_cost_usd"`
	CreatedAt        string  `json:"created_at"`
}

// GlobalUsage holds aggregate usage stats across all users.
type GlobalUsage struct {
	TotalUsers    int     `json:"total_users"`
	TotalEvals    int     `json:"total_evals"`
	TotalCostUSD  float64 `json:"total_cost_usd"`
	ActiveUsers   int     `json:"active_users"`
}

// ModelInfo describes a supported LLM model.
type ModelInfo struct {
	ID           string  `json:"id"`
	Name         string  `json:"name"`
	Provider     string  `json:"provider"`
	InputPer1M   float64 `json:"input_per_1m"`
	OutputPer1M  float64 `json:"output_per_1m"`
}

// ErrorResponse is the standard JSON error envelope.
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}
