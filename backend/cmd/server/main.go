// Command server starts the PromptDiff API server.
package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Maik425/promptdiff/internal/config"
	"github.com/Maik425/promptdiff/internal/handler"
	mw "github.com/Maik425/promptdiff/internal/middleware"
	"github.com/Maik425/promptdiff/internal/provider"
	"github.com/Maik425/promptdiff/internal/service"
	"github.com/Maik425/promptdiff/internal/store"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/lib/pq"
)

// Rate-limit parameters. All RPS values are in requests-per-second to match
// golang.org/x/time/rate; burst is the maximum token-bucket capacity.
const (
	// ipRPS: 10 requests per minute for public auth endpoints.
	ipRPS   = 10.0 / 60.0
	ipBurst = 10

	// compareRPS: 20 requests per minute for POST /v1/compare (expensive endpoint).
	compareRPS   = 20.0 / 60.0
	compareBurst = 20

	// apiKeyRPS: 60 requests per minute for general authenticated routes.
	apiKeyRPS   = 60.0 / 60.0
	apiKeyBurst = 60
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("config: %w", err)
	}

	// Database.
	pg, err := store.NewPostgresStore(cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("database: %w", err)
	}
	defer pg.Close()

	// LLM providers — skip those with empty API keys so the server starts in
	// partial mode during development.
	var providers []provider.Provider
	if cfg.AnthropicKey != "" {
		providers = append(providers, provider.NewAnthropicProvider(cfg.AnthropicKey))
	}
	if cfg.OpenAIKey != "" {
		providers = append(providers, provider.NewOpenAIProvider(cfg.OpenAIKey))
	}
	if cfg.GoogleAIKey != "" {
		providers = append(providers, provider.NewGoogleProvider(cfg.GoogleAIKey))
	}
	if cfg.XAIKey != "" {
		providers = append(providers, provider.NewXAIProvider(cfg.XAIKey))
	}

	registry := provider.NewRegistry(providers...)
	evalSvc := service.NewEvalService(registry, pg)
	h := handler.New(cfg, pg, evalSvc, registry)

	// done is closed on graceful shutdown to stop background goroutines
	// (e.g. rate-limiter stale-entry cleanup).
	done := make(chan struct{})

	// Echo setup.
	e := echo.New()
	e.HideBanner = true
	e.HidePort = true

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.BodyLimit("1M")) // Max 1MB request body
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"https://promptdiff.bizmarq.com", "http://localhost:3000", "http://localhost:3001"},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderContentType, echo.HeaderAuthorization},
		AllowCredentials: false,
	}))

	// Custom HTTP error handler for consistent JSON error responses.
	e.HTTPErrorHandler = func(err error, c echo.Context) {
		code := http.StatusInternalServerError
		message := "internal server error"

		if he, ok := err.(*echo.HTTPError); ok {
			code = he.Code
			if m, ok := he.Message.(string); ok {
				message = m
			}
		}

		if !c.Response().Committed {
			_ = c.JSON(code, map[string]string{"error": message})
		}
	}

	// Rate limiters.
	ipRL      := mw.IPRateLimit(ipRPS, ipBurst, done)
	generalRL := mw.APIKeyRateLimit(apiKeyRPS, apiKeyBurst, done)
	compareRL := mw.APIKeyRateLimit(compareRPS, compareBurst, done)

	// Public routes — IP-based rate limiting applied per-route.
	v1 := e.Group("/v1")
	v1.POST("/auth/signup", h.Signup, ipRL)
	v1.POST("/auth/login", h.Login, ipRL)

	// Google OAuth — registered only when credentials are configured.
	if cfg.GoogleOAuthClientID != "" {
		v1.GET("/auth/google", h.GoogleAuthRedirect)
		v1.GET("/auth/google/callback", h.GoogleAuthCallback)
	}

	// Authenticated routes — API-key rate limiting applied per-route.
	auth := v1.Group("", mw.APIKeyAuth(pg))
	auth.POST("/compare", h.Compare, compareRL)
	auth.GET("/evals", h.ListEvals, generalRL)
	auth.GET("/evals/:id", h.GetEval, generalRL)
	auth.GET("/models", h.ListModels, generalRL)
	auth.GET("/usage", h.GetUsage, generalRL)

	// Settings routes.
	settings := auth.Group("/settings")
	settings.PUT("/spend-limit", h.UpdateSpendLimit, generalRL)
	settings.PUT("/password", h.UpdatePassword, generalRL)
	settings.POST("/regenerate-key", h.RegenerateAPIKey, generalRL)
	settings.DELETE("/account", h.DeleteAccount, generalRL)

	// Billing routes — only registered when Stripe is configured.
	// Webhook is public (Stripe signs it); checkout-session and status require auth.
	if cfg.StripeSecretKey != "" {
		billing := auth.Group("/billing")
		billing.POST("/checkout-session", h.CreateCheckoutSession, generalRL)
		billing.GET("/status", h.GetBillingStatus, generalRL)

		// Webhook must not go through the APIKeyAuth middleware — Stripe signs the
		// payload itself and has no API key to pass.
		v1.POST("/billing/webhook", h.HandleStripeWebhook)
	}

	// Health check (no auth, no rate limit).
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	// Graceful shutdown.
	addr := fmt.Sprintf(":%s", cfg.Port)
	fmt.Printf("PromptDiff API listening on %s\n", addr)

	go func() {
		if err := e.Start(addr); err != nil && err != http.ErrServerClosed {
			fmt.Fprintf(os.Stderr, "server error: %v\n", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	fmt.Println("shutting down...")
	close(done) // stop background goroutines

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	return e.Shutdown(ctx)
}
