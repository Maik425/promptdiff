package handler

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/Maik425/promptdiff/internal/model"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// oauthStateEntry holds a state token with its expiry time.
type oauthStateEntry struct {
	expiresAt time.Time
}

// oauthStateStore is a small in-memory CSRF state store with a 5-minute TTL.
// It is embedded in the Handler so it is initialised once at startup.
type oauthStateStore struct {
	mu      sync.Mutex
	entries map[string]oauthStateEntry
}

// newOAuthStateStore creates a ready-to-use state store.
func newOAuthStateStore() *oauthStateStore {
	return &oauthStateStore{entries: make(map[string]oauthStateEntry)}
}

// add generates and stores a new random state token, returning it.
func (s *oauthStateStore) add() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("oauth state: generate random bytes: %w", err)
	}
	state := hex.EncodeToString(b)

	s.mu.Lock()
	defer s.mu.Unlock()

	// Prune expired entries every time we add a new one (cheap amortised cleanup).
	now := time.Now()
	for k, e := range s.entries {
		if now.After(e.expiresAt) {
			delete(s.entries, k)
		}
	}

	s.entries[state] = oauthStateEntry{expiresAt: now.Add(5 * time.Minute)}
	return state, nil
}

// consume returns true and removes the state if it exists and has not expired.
func (s *oauthStateStore) consume(state string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	e, ok := s.entries[state]
	if !ok {
		return false
	}
	delete(s.entries, state)
	return time.Now().Before(e.expiresAt)
}

// googleTokenResponse is the JSON payload returned by the Google token endpoint.
type googleTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
	IDToken     string `json:"id_token"`
}

// googleUserInfo is the JSON payload from the Google userinfo endpoint.
type googleUserInfo struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

// GoogleAuthRedirect handles GET /v1/auth/google.
// It generates a CSRF state token, stores it, then redirects the browser to
// Google's OAuth 2.0 consent screen.
func (h *Handler) GoogleAuthRedirect(c echo.Context) error {
	state, err := h.oauthStates.add()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate state token")
	}

	params := url.Values{}
	params.Set("client_id", h.cfg.GoogleOAuthClientID)
	params.Set("redirect_uri", h.cfg.GoogleOAuthRedirectURL)
	params.Set("response_type", "code")
	params.Set("scope", "email profile")
	params.Set("state", state)
	params.Set("access_type", "online")

	consentURL := "https://accounts.google.com/o/oauth2/v2/auth?" + params.Encode()
	return c.Redirect(http.StatusFound, consentURL)
}

// GoogleAuthCallback handles GET /v1/auth/google/callback.
// It exchanges the authorization code for an access token, fetches the user's
// email from Google, creates a new account if needed, and redirects the browser
// back to the frontend with a JWT and API key as query parameters.
func (h *Handler) GoogleAuthCallback(c echo.Context) error {
	// Validate CSRF state.
	state := c.QueryParam("state")
	if state == "" || !h.oauthStates.consume(state) {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid or expired OAuth state")
	}

	code := c.QueryParam("code")
	if code == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "missing authorization code")
	}

	// Exchange the authorization code for tokens.
	tokenResp, err := h.exchangeGoogleCode(code)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadGateway, "failed to exchange authorization code")
	}

	// Fetch user info from Google.
	info, err := h.fetchGoogleUserInfo(tokenResp.AccessToken)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadGateway, "failed to fetch user info from Google")
	}

	if info.Email == "" {
		return echo.NewHTTPError(http.StatusBadGateway, "Google did not return an email address")
	}

	// Generate a fresh raw API key for this OAuth session. The hash is stored;
	// the raw key is passed to the frontend once via redirect.
	// Regenerating on every OAuth login ensures we can always return a usable
	// raw key (hashes are not reversible, so we cannot recover prior raw keys).
	rawKey, err := generateAPIKey()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate API key")
	}

	candidate := &model.User{
		ID:           uuid.New().String(),
		Email:        info.Email,
		PasswordHash: "", // Google users have no password.
		APIKey:       hashAPIKey(rawKey),
		Plan:         model.PlanFree,
		CreatedAt:    time.Now().UTC(),
		AuthProvider: model.AuthProviderGoogle,
	}

	user, err := h.store.CreateOrGetOAuthUser(c.Request().Context(), candidate)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create or fetch user")
	}

	// Mark that this user has used Google login.
	_ = h.store.SetGoogleLinked(c.Request().Context(), user.ID)

	// Generate JWT for the dashboard browser session.
	token, err := h.generateJWT(user.ID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate session token")
	}

	// Redirect to frontend with JWT. API key is only included for new users.
	redirectParams := url.Values{}
	redirectParams.Set("token", token)
	if user.ID == candidate.ID {
		// New user — show API key once
		redirectParams.Set("api_key", rawKey)
	}

	frontendURL := h.cfg.FrontendBaseURL + "/login?" + redirectParams.Encode()
	return c.Redirect(http.StatusFound, frontendURL)
}

// exchangeGoogleCode posts the authorization code to Google's token endpoint
// and returns the parsed token response.
func (h *Handler) exchangeGoogleCode(code string) (*googleTokenResponse, error) {
	form := url.Values{}
	form.Set("code", code)
	form.Set("client_id", h.cfg.GoogleOAuthClientID)
	form.Set("client_secret", h.cfg.GoogleOAuthClientSecret)
	form.Set("redirect_uri", h.cfg.GoogleOAuthRedirectURL)
	form.Set("grant_type", "authorization_code")

	resp, err := http.Post(
		"https://oauth2.googleapis.com/token",
		"application/x-www-form-urlencoded",
		strings.NewReader(form.Encode()),
	)
	if err != nil {
		return nil, fmt.Errorf("google token exchange: http post: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("google token exchange: read body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("google token exchange: unexpected status %d: %s", resp.StatusCode, body)
	}

	var tokenResp googleTokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return nil, fmt.Errorf("google token exchange: unmarshal: %w", err)
	}
	if tokenResp.AccessToken == "" {
		return nil, fmt.Errorf("google token exchange: empty access_token in response")
	}
	return &tokenResp, nil
}

// fetchGoogleUserInfo calls the Google userinfo endpoint using the given access token.
func (h *Handler) fetchGoogleUserInfo(accessToken string) (*googleUserInfo, error) {
	req, err := http.NewRequest(http.MethodGet, "https://www.googleapis.com/oauth2/v2/userinfo", nil)
	if err != nil {
		return nil, fmt.Errorf("google userinfo: create request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("google userinfo: http get: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("google userinfo: read body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("google userinfo: unexpected status %d: %s", resp.StatusCode, body)
	}

	var info googleUserInfo
	if err := json.Unmarshal(body, &info); err != nil {
		return nil, fmt.Errorf("google userinfo: unmarshal: %w", err)
	}
	return &info, nil
}
