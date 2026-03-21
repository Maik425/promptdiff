// Package middleware contains Echo middleware for the PromptDiff API.
package middleware

import (
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"strings"

	"github.com/Maik425/promptdiff/internal/model"
	"github.com/Maik425/promptdiff/internal/store"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

const (
	userIDKey  = "user_id"
	userObjKey = "user"
)

// Auth returns middleware that accepts EITHER:
//   - Bearer pd_xxx  → API key auth (for SDK/curl)
//   - Bearer eyJ...  → JWT auth (for dashboard browser sessions)
func Auth(s store.Store, jwtSecret string) echo.MiddlewareFunc {
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

			token := strings.TrimSpace(parts[1])
			if token == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "empty token")
			}

			// Determine auth method by token format
			if strings.HasPrefix(token, "pd_") {
				// API key auth
				return authByAPIKey(c, s, token, next)
			}
			// JWT auth
			return authByJWT(c, s, token, jwtSecret, next)
		}
	}
}

// authByAPIKey validates a pd_xxx API key.
func authByAPIKey(c echo.Context, s store.Store, rawKey string, next echo.HandlerFunc) error {
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

// authByJWT validates a JWT token and looks up the user by ID.
func authByJWT(c echo.Context, s store.Store, tokenStr string, jwtSecret string, next echo.HandlerFunc) error {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, echo.NewHTTPError(http.StatusUnauthorized, "invalid token signing method")
		}
		return []byte(jwtSecret), nil
	})
	if err != nil || !token.Valid {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid token claims")
	}

	userID, ok := claims["sub"].(string)
	if !ok || userID == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid token subject")
	}

	user, err := s.GetUserByID(c.Request().Context(), userID)
	if err != nil {
		if err == store.ErrNotFound {
			return echo.NewHTTPError(http.StatusUnauthorized, "user not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "auth lookup failed")
	}

	c.Set(userIDKey, user.ID)
	c.Set(userObjKey, user)
	return next(c)
}

// UserIDFromContext extracts the authenticated user's ID from the Echo context.
func UserIDFromContext(c echo.Context) string {
	v := c.Get(userIDKey)
	if v == nil {
		panic("auth middleware was not applied to this route")
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
func hashAPIKey(rawKey string) string {
	h := sha256.Sum256([]byte(rawKey))
	return hex.EncodeToString(h[:])
}
