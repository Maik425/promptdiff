package handler

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/Maik425/promptdiff/internal/model"
	"github.com/Maik425/promptdiff/internal/store"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

// Signup handles POST /v1/auth/signup.
// It creates a new user account, hashes the password, generates an API key,
// and returns the new user's ID and API key.
func (h *Handler) Signup(c echo.Context) error {
	var req model.SignupRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	if req.Email == "" || req.Password == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "email and password are required")
	}

	// Input validation
	if len(req.Email) > 254 {
		return echo.NewHTTPError(http.StatusBadRequest, "email too long")
	}
	if !strings.Contains(req.Email, "@") || !strings.Contains(req.Email, ".") {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid email format")
	}
	if len(req.Password) < 8 {
		return echo.NewHTTPError(http.StatusBadRequest, "password must be at least 8 characters")
	}
	if len(req.Password) > 128 {
		return echo.NewHTTPError(http.StatusBadRequest, "password too long (max 128 characters)")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to hash password")
	}

	rawKey, err := generateAPIKey()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate API key")
	}

	user := &model.User{
		ID:           uuid.New().String(),
		Email:        req.Email,
		PasswordHash: string(hash),
		APIKey:       hashAPIKey(rawKey),
		Plan:         model.PlanFree,
		CreatedAt:    time.Now().UTC(),
	}

	if err := h.store.CreateUser(c.Request().Context(), user); err != nil {
		if err == store.ErrConflict {
			// Generic message to prevent user enumeration (Finding 1.6).
			return echo.NewHTTPError(http.StatusConflict, "signup failed")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create user")
	}

	// Return the raw key once — it is never retrievable again after this point.
	return c.JSON(http.StatusCreated, model.SignupResponse{
		UserID: user.ID,
		APIKey: rawKey,
	})
}

// Login handles POST /v1/auth/login.
// It verifies the password, then returns a signed JWT and the user's API key.
func (h *Handler) Login(c echo.Context) error {
	var req model.LoginRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	if req.Email == "" || req.Password == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "email and password are required")
	}

	user, err := h.store.GetUserByEmail(c.Request().Context(), req.Email)
	if err != nil {
		if err == store.ErrNotFound {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "login failed")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
	}

	// JWT generation is intentionally removed (Finding 1.3): no route validates
	// JWTs, so issuing them was misleading. Authentication uses API keys only.
	// The raw API key is shown once at signup or regeneration; it cannot be
	// recovered from the stored hash, so login only confirms credentials.
	return c.JSON(http.StatusOK, model.LoginResponse{
		APIKey: "",
	})
}

// generateJWT creates a signed JWT for the given user ID.
func (h *Handler) generateJWT(userID string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"iat": time.Now().Unix(),
		"exp": time.Now().Add(30 * 24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.cfg.JWTSecret))
}

// generateAPIKey returns a unique API key in the format pd_<32 hex chars>.
func generateAPIKey() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("generate api key: %w", err)
	}
	return "pd_" + hex.EncodeToString(b), nil
}

// hashAPIKey returns a hex-encoded SHA-256 digest of rawKey.
// Only the hash is stored in the database; the raw key is shown to the user once.
func hashAPIKey(rawKey string) string {
	h := sha256.Sum256([]byte(rawKey))
	return hex.EncodeToString(h[:])
}
