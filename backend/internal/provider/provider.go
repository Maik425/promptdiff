// Package provider defines the LLM provider interface and shared completion types.
package provider

import (
	"context"

	"github.com/Maik425/promptdiff/internal/model"
)

// CompletionRequest carries the parameters for a single model completion.
type CompletionRequest struct {
	Model       string
	Prompt      string
	Input       string
	Temperature float64
	MaxTokens   int
}

// CompletionResult holds the outcome of one model completion.
type CompletionResult struct {
	Model     string
	Provider  string
	Output    string
	LatencyMs int64
	Tokens    model.TokenUsage
	CostUSD   float64
	Error     string
}

// Provider is the interface every LLM backend must implement.
type Provider interface {
	// Name returns the provider identifier (e.g. "anthropic").
	Name() string

	// Complete sends a prompt to the model and returns the result.
	Complete(ctx context.Context, req CompletionRequest) (*CompletionResult, error)

	// SupportedModels returns the list of models this provider can serve.
	SupportedModels() []model.ModelInfo
}

// Registry maps model IDs to the provider that handles them.
type Registry struct {
	providers  []Provider
	modelIndex map[string]Provider
}

// NewRegistry builds a registry from the given providers.
func NewRegistry(providers ...Provider) *Registry {
	r := &Registry{
		providers:  providers,
		modelIndex: make(map[string]Provider),
	}
	for _, p := range providers {
		for _, m := range p.SupportedModels() {
			r.modelIndex[m.ID] = p
		}
	}
	return r
}

// Lookup returns the provider for the given model ID, and a boolean indicating
// whether the model is known.
func (r *Registry) Lookup(modelID string) (Provider, bool) {
	p, ok := r.modelIndex[modelID]
	return p, ok
}

// AllModels returns every ModelInfo from all registered providers.
func (r *Registry) AllModels() []model.ModelInfo {
	var out []model.ModelInfo
	for _, p := range r.providers {
		out = append(out, p.SupportedModels()...)
	}
	return out
}
