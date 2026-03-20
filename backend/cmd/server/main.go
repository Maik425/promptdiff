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

	// Echo setup.
	e := echo.New()
	e.HideBanner = true
	e.HidePort = true

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodOptions},
		AllowHeaders: []string{echo.HeaderContentType, echo.HeaderAuthorization},
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

	// Public routes.
	v1 := e.Group("/v1")
	v1.POST("/auth/signup", h.Signup)
	v1.POST("/auth/login", h.Login)

	// Authenticated routes.
	auth := v1.Group("", mw.APIKeyAuth(pg))
	auth.POST("/compare", h.Compare)
	auth.GET("/evals", h.ListEvals)
	auth.GET("/evals/:id", h.GetEval)
	auth.GET("/models", h.ListModels)
	auth.GET("/usage", h.GetUsage)

	// Health check (no auth).
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
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	return e.Shutdown(ctx)
}
