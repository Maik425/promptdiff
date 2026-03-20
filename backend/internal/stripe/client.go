// Package stripe provides a minimal Stripe REST API client.
// It uses net/http directly with form-encoded bodies — no SDK dependency.
package stripe

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

const baseURL = "https://api.stripe.com/v1"

// Client is a thin wrapper around the Stripe REST API.
type Client struct {
	secretKey  string
	httpClient *http.Client
}

// New returns a Client authenticated with secretKey.
func New(secretKey string) *Client {
	return &Client{
		secretKey: secretKey,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

// Customer represents the Stripe Customer object fields we care about.
type Customer struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

// CheckoutSession represents the fields we need from a Stripe Checkout Session.
type CheckoutSession struct {
	ID  string `json:"id"`
	URL string `json:"url"`
}

// SetupIntent represents the Stripe SetupIntent object.
type SetupIntent struct {
	ID                  string `json:"id"`
	PaymentMethod       string `json:"payment_method"`
	PaymentMethodString string `json:"-"` // populated when payment_method is a string
}

// Event is the top-level Stripe webhook event envelope.
type Event struct {
	ID   string          `json:"id"`
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}

// CheckoutSessionEventData holds the object inside a checkout event's data field.
type CheckoutSessionEventData struct {
	Object struct {
		ID          string `json:"id"`
		Customer    string `json:"customer"`
		SetupIntent string `json:"setup_intent"`
	} `json:"object"`
}

// CreateCustomer creates a new Stripe Customer for the given email and internal user ID.
func (c *Client) CreateCustomer(email, promptdiffUserID string) (*Customer, error) {
	params := url.Values{}
	params.Set("email", email)
	params.Set("metadata[promptdiff_user_id]", promptdiffUserID)

	var cust Customer
	if err := c.post("/customers", params, &cust); err != nil {
		return nil, fmt.Errorf("stripe: create customer: %w", err)
	}
	return &cust, nil
}

// CreateCheckoutSession creates a Checkout Session in setup mode.
// customerID must be a valid cus_xxx Stripe customer ID.
func (c *Client) CreateCheckoutSession(customerID, successURL, cancelURL string) (*CheckoutSession, error) {
	params := url.Values{}
	params.Set("mode", "setup")
	params.Set("customer", customerID)
	params.Set("success_url", successURL)
	params.Set("cancel_url", cancelURL)
	params.Set("payment_method_types[0]", "card")

	var sess CheckoutSession
	if err := c.post("/checkout/sessions", params, &sess); err != nil {
		return nil, fmt.Errorf("stripe: create checkout session: %w", err)
	}
	return &sess, nil
}

// VerifyWebhookSignature validates the Stripe-Signature header against the raw body
// and returns the parsed Event on success. It rejects events older than 5 minutes.
// See: https://stripe.com/docs/webhooks/signatures
func VerifyWebhookSignature(payload []byte, sigHeader, webhookSecret string) (*Event, error) {
	// sigHeader format: t=<timestamp>,v1=<sig1>[,v1=<sig2>...]
	var timestamp int64
	var signatures []string

	for _, part := range strings.Split(sigHeader, ",") {
		kv := strings.SplitN(part, "=", 2)
		if len(kv) != 2 {
			continue
		}
		switch kv[0] {
		case "t":
			ts, err := strconv.ParseInt(kv[1], 10, 64)
			if err != nil {
				return nil, fmt.Errorf("stripe: invalid timestamp in signature header")
			}
			timestamp = ts
		case "v1":
			signatures = append(signatures, kv[1])
		}
	}

	if timestamp == 0 {
		return nil, fmt.Errorf("stripe: missing timestamp in signature header")
	}
	if len(signatures) == 0 {
		return nil, fmt.Errorf("stripe: missing v1 signature in header")
	}

	// Reject events older than 5 minutes to guard against replay attacks.
	age := time.Now().Unix() - timestamp
	if age > 300 || age < -300 {
		return nil, fmt.Errorf("stripe: webhook timestamp too old or too far in future (%ds)", age)
	}

	// Compute expected signature: HMAC-SHA256(timestamp.payload, secret).
	signedPayload := fmt.Sprintf("%d.%s", timestamp, string(payload))
	mac := hmac.New(sha256.New, []byte(webhookSecret))
	mac.Write([]byte(signedPayload))
	expected := hex.EncodeToString(mac.Sum(nil))

	for _, sig := range signatures {
		if hmac.Equal([]byte(sig), []byte(expected)) {
			var evt Event
			if err := json.Unmarshal(payload, &evt); err != nil {
				return nil, fmt.Errorf("stripe: unmarshal event: %w", err)
			}
			return &evt, nil
		}
	}

	return nil, fmt.Errorf("stripe: signature verification failed")
}

// post sends a form-encoded POST to the Stripe API and JSON-decodes the response.
func (c *Client) post(path string, params url.Values, out interface{}) error {
	req, err := http.NewRequest(http.MethodPost, baseURL+path, strings.NewReader(params.Encode()))
	if err != nil {
		return fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.SetBasicAuth(c.secretKey, "")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("http: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("read body: %w", err)
	}

	if resp.StatusCode >= 400 {
		// Try to extract Stripe's error message.
		var apiErr struct {
			Error struct {
				Message string `json:"message"`
				Code    string `json:"code"`
			} `json:"error"`
		}
		if jsonErr := json.Unmarshal(body, &apiErr); jsonErr == nil && apiErr.Error.Message != "" {
			return fmt.Errorf("stripe API error %d: %s", resp.StatusCode, apiErr.Error.Message)
		}
		return fmt.Errorf("stripe API error %d: %s", resp.StatusCode, string(body))
	}

	if out != nil {
		if err := json.Unmarshal(body, out); err != nil {
			return fmt.Errorf("decode response: %w", err)
		}
	}
	return nil
}
