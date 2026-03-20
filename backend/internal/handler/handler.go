// Package handler contains the HTTP handlers for the PromptDiff API.
package handler

import (
	"github.com/Maik425/promptdiff/internal/config"
	"github.com/Maik425/promptdiff/internal/provider"
	"github.com/Maik425/promptdiff/internal/service"
	"github.com/Maik425/promptdiff/internal/store"
)

// Handler holds shared dependencies for all route handlers.
type Handler struct {
	cfg         *config.Config
	store       store.Store
	evalSvc     *service.EvalService
	registry    *provider.Registry
	oauthStates *oauthStateStore
}

// New creates a Handler with the given dependencies.
func New(cfg *config.Config, s store.Store, evalSvc *service.EvalService, registry *provider.Registry) *Handler {
	return &Handler{
		cfg:         cfg,
		store:       s,
		evalSvc:     evalSvc,
		registry:    registry,
		oauthStates: newOAuthStateStore(),
	}
}
