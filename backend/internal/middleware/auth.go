// Package middleware contains Echo middleware for the PromptDiff API.
package middleware

import (
	"net/http"
	"strings"

	"github.com/Maik425/promptdiff/internal/store"
	"github.com/labstack/echo/v4"
)

const userIDKey = "user_id"

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

			apiKey := strings.TrimSpace(parts[1])
			if apiKey == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "empty API key")
			}

			user, err := s.GetUserByAPIKey(c.Request().Context(), apiKey)
			if err != nil {
				if err == store.ErrNotFound {
					return echo.NewHTTPError(http.StatusUnauthorized, "invalid API key")
				}
				return echo.NewHTTPError(http.StatusInternalServerError, "auth lookup failed")
			}

			c.Set(userIDKey, user.ID)
			return next(c)
		}
	}
}

// UserIDFromContext extracts the authenticated user's ID from the Echo context.
// It panics if the middleware was not applied, which is a programming error.
func UserIDFromContext(c echo.Context) string {
	v := c.Get(userIDKey)
	if v == nil {
		panic("middleware.APIKeyAuth was not applied to this route")
	}
	return v.(string)
}
