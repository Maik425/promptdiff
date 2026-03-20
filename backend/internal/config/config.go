// Package config handles application configuration loaded from environment variables.
package config

import (
	"fmt"
	"os"
	"strconv"
)

// Config holds all application configuration.
type Config struct {
	Port           string
	DatabaseURL    string
	JWTSecret      string
	AnthropicKey   string
	OpenAIKey      string
	GoogleAIKey    string
	XAIKey         string

	// Stripe — all optional. Billing endpoints return 501 if StripeSecretKey is empty.
	StripeSecretKey     string
	StripeWebhookSecret string
	StripeSuccessURL    string
	StripeCancelURL     string
}

// Load reads configuration from environment variables.
// Required variables are validated and an error is returned if any are missing.
func Load() (*Config, error) {
	cfg := &Config{
		Port:         getEnv("PORT", "8082"),
		DatabaseURL:  os.Getenv("DATABASE_URL"),
		JWTSecret:    os.Getenv("JWT_SECRET"),
		AnthropicKey: os.Getenv("ANTHROPIC_API_KEY"),
		OpenAIKey:    os.Getenv("OPENAI_API_KEY"),
		GoogleAIKey:  os.Getenv("GOOGLE_AI_API_KEY"),
		XAIKey:       os.Getenv("XAI_API_KEY"),

		StripeSecretKey:     os.Getenv("STRIPE_SECRET_KEY"),
		StripeWebhookSecret: os.Getenv("STRIPE_WEBHOOK_SECRET"),
		StripeSuccessURL: getEnv(
			"STRIPE_SUCCESS_URL",
			"https://promptdiff.bizmarq.com/dashboard?payment=success",
		),
		StripeCancelURL: getEnv(
			"STRIPE_CANCEL_URL",
			"https://promptdiff.bizmarq.com/dashboard?payment=cancelled",
		),
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}

	return cfg, nil
}

// PortInt returns the port as an integer.
func (c *Config) PortInt() int {
	n, err := strconv.Atoi(c.Port)
	if err != nil {
		return 8082
	}
	return n
}

func getEnv(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultVal
}
