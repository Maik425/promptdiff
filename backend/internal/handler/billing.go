package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/Maik425/promptdiff/internal/middleware"
	stripeclient "github.com/Maik425/promptdiff/internal/stripe"
	"github.com/labstack/echo/v4"
)

// stripeNotConfigured is returned when STRIPE_SECRET_KEY is not set.
func stripeNotConfigured() error {
	return echo.NewHTTPError(http.StatusNotImplemented, "stripe is not configured")
}

// CreateCheckoutSession handles POST /v1/billing/checkout-session.
// Creates a Stripe Checkout Session in setup mode so the user can register a card.
// Returns { "checkout_url": "https://checkout.stripe.com/..." }.
func (h *Handler) CreateCheckoutSession(c echo.Context) error {
	if h.cfg.StripeSecretKey == "" {
		return stripeNotConfigured()
	}

	user := middleware.UserFromContext(c)
	if user == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}

	sc := stripeclient.New(h.cfg.StripeSecretKey)

	// Ensure the user has a Stripe Customer record.
	customerID := user.StripeCustomerID
	if customerID == "" {
		cust, err := sc.CreateCustomer(user.Email, user.ID)
		if err != nil {
			c.Logger().Errorf("billing: create customer: %v", err)
			return echo.NewHTTPError(http.StatusInternalServerError, "billing service error")
		}
		customerID = cust.ID

		// Persist the new customer ID so we don't create duplicates.
		if err := h.store.UpdateStripeCustomer(c.Request().Context(), user.ID, customerID); err != nil {
			// Non-fatal: log the error but continue — the session is already created.
			c.Logger().Errorf("billing: persist stripe_customer_id for user %s: %v", user.ID, err)
		}
	}

	sess, err := sc.CreateCheckoutSession(customerID, h.cfg.StripeSuccessURL, h.cfg.StripeCancelURL)
	if err != nil {
		c.Logger().Errorf("billing: create session: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "billing service error")
	}

	return c.JSON(http.StatusOK, map[string]string{
		"checkout_url": sess.URL,
	})
}

// GetBillingStatus handles GET /v1/billing/status.
// Returns the authenticated user's billing state.
func (h *Handler) GetBillingStatus(c echo.Context) error {
	if h.cfg.StripeSecretKey == "" {
		return stripeNotConfigured()
	}

	user := middleware.UserFromContext(c)
	if user == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"has_payment_method":  user.HasPaymentMethod,
		"has_stripe_account":  user.StripeCustomerID != "",
		"plan":                string(user.Plan),
	})
}

// HandleStripeWebhook handles POST /v1/billing/webhook.
// Stripe signs all webhook payloads; we verify before processing.
// No authentication middleware — Stripe itself authenticates via HMAC signature.
func (h *Handler) HandleStripeWebhook(c echo.Context) error {
	if h.cfg.StripeWebhookSecret == "" {
		// If webhook secret is not set we cannot verify; reject to avoid silently
		// accepting unverified events in production.
		return echo.NewHTTPError(http.StatusNotImplemented, "stripe webhook secret is not configured")
	}

	// Read the raw body BEFORE any framework parsing — required for signature verification.
	rawBody, err := io.ReadAll(io.LimitReader(c.Request().Body, 65536)) // 64KB max for webhook
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "failed to read request body")
	}

	sigHeader := c.Request().Header.Get("Stripe-Signature")
	if sigHeader == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "missing Stripe-Signature header")
	}

	evt, err := stripeclient.VerifyWebhookSignature(rawBody, sigHeader, h.cfg.StripeWebhookSecret)
	if err != nil {
		c.Logger().Warnf("billing: webhook signature verification failed: %v", err)
		return echo.NewHTTPError(http.StatusUnauthorized, "webhook signature verification failed")
	}

	switch evt.Type {
	case "checkout.session.completed":
		if err := h.handleCheckoutSessionCompleted(c, evt); err != nil {
			c.Logger().Errorf("billing: handle checkout.session.completed: %v", err)
			// Return 200 so Stripe does not retry — we already logged the failure.
			// For idempotency, a retry would attempt to double-update the same user.
		}
	default:
		// Acknowledge unhandled event types without error.
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

// handleCheckoutSessionCompleted processes a checkout.session.completed webhook event.
// It sets has_payment_method = true and persists stripe_customer_id if not already stored.
func (h *Handler) handleCheckoutSessionCompleted(c echo.Context, evt *stripeclient.Event) error {
	var data stripeclient.CheckoutSessionEventData
	if err := json.Unmarshal(evt.Data, &data); err != nil {
		return fmt.Errorf("unmarshal checkout session data: %w", err)
	}

	stripeCustomerID := data.Object.Customer
	if stripeCustomerID == "" {
		return fmt.Errorf("checkout.session.completed event missing customer field")
	}

	// Resolve the internal user via stripe_customer_id.
	user, err := h.store.GetUserByStripeCustomerID(c.Request().Context(), stripeCustomerID)
	if err != nil {
		return fmt.Errorf("look up user for stripe customer %s: %w", stripeCustomerID, err)
	}

	// Mark payment method as active. This allows the user to exceed the free quota.
	if err := h.store.SetPaymentMethod(c.Request().Context(), user.ID, true); err != nil {
		return fmt.Errorf("set payment method for user %s: %w", user.ID, err)
	}

	c.Logger().Infof("billing: user %s (%s) added payment method via checkout session %s",
		user.ID, user.Email, data.Object.ID)
	return nil
}
