// Package middleware contains Echo middleware for the PromptDiff API.
package middleware

import (
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"strings"

	"github.com/Maik425/promptdiff/internal/model"
	"github.com/Maik425/promptdiff/internal/store"
	"github.com/labstack/echo/v4"
)

const (
	userIDKey  = "user_id"
	userObjKey = "user"
)

// APIKeyAuth returns an Echo middleware that validates Bearer tokens against
// the API key stored in the database.
func APIKeyAuth(s store.Store) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "missing Authorization header")
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "bearer") {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid Authorization header format")
			}

			rawKey := strings.TrimSpace(parts[1])
			if rawKey == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "empty API key")
			}

			// Hash the incoming key before lookup — only SHA-256 digests are
			// stored in the database (Finding 1.1).
			user, err := s.GetUserByAPIKey(c.Request().Context(), hashAPIKey(rawKey))
			if err != nil {
				if err == store.ErrNotFound {
					return echo.NewHTTPError(http.StatusUnauthorized, "invalid API key")
				}
				return echo.NewHTTPError(http.StatusInternalServerError, "auth lookup failed")
			}

			c.Set(userIDKey, user.ID)
			c.Set(userObjKey, user)
			return next(c)
		}
	}
}

// UserIDFromContext extracts the authenticated user's ID from the Echo context.
func UserIDFromContext(c echo.Context) string {
	v := c.Get(userIDKey)
	if v == nil {
		panic("middleware.APIKeyAuth was not applied to this route")
	}
	return v.(string)
}

// UserFromContext extracts the full user object from the Echo context.
func UserFromContext(c echo.Context) *model.User {
	v := c.Get(userObjKey)
	if v == nil {
		return nil
	}
	return v.(*model.User)
}

// hashAPIKey returns a hex-encoded SHA-256 digest of rawKey.
// Mirrors the helper in the handler package; duplicated here to avoid a
// circular import between middleware and handler.
func hashAPIKey(rawKey string) string {
	h := sha256.Sum256([]byte(rawKey))
	return hex.EncodeToString(h[:])
}
