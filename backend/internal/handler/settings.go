package handler

import (
	"net/http"

	mw "github.com/Maik425/promptdiff/internal/middleware"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

// UpdateSpendLimit handles PUT /v1/settings/spend-limit.
// Updates the authenticated user's monthly spend cap.
func (h *Handler) UpdateSpendLimit(c echo.Context) error {
	var req struct {
		MonthlySpendLimit float64 `json:"monthly_spend_limit"`
	}
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	if req.MonthlySpendLimit < 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "monthly_spend_limit must be >= 0")
	}
	if req.MonthlySpendLimit > 10000 {
		return echo.NewHTTPError(http.StatusBadRequest, "monthly_spend_limit must be <= 10000")
	}

	userID := mw.UserIDFromContext(c)
	if err := h.store.UpdateSpendLimit(c.Request().Context(), userID, req.MonthlySpendLimit); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to update spend limit")
	}

	return c.JSON(http.StatusOK, map[string]float64{
		"monthly_spend_limit": req.MonthlySpendLimit,
	})
}

// UpdatePassword handles PUT /v1/settings/password.
// Verifies the current password and replaces it with a new hashed password.
// Returns an error for Google OAuth users who have no password.
func (h *Handler) UpdatePassword(c echo.Context) error {
	var req struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	if req.CurrentPassword == "" || req.NewPassword == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "current_password and new_password are required")
	}
	if len(req.NewPassword) < 8 {
		return echo.NewHTTPError(http.StatusBadRequest, "new_password must be at least 8 characters")
	}

	userID := mw.UserIDFromContext(c)
	user, err := h.store.GetUserByID(c.Request().Context(), userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to fetch user")
	}

	if user.AuthProvider == "google" {
		return echo.NewHTTPError(http.StatusBadRequest, "password change is not available for Google accounts")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword)); err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "current password is incorrect")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to hash password")
	}

	if err := h.store.UpdatePassword(c.Request().Context(), userID, string(hash)); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to update password")
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "password updated"})
}

// RegenerateAPIKey handles POST /v1/settings/regenerate-key.
// Generates a fresh API key, stores it, and returns it to the caller.
// The old key is immediately invalidated.
func (h *Handler) RegenerateAPIKey(c echo.Context) error {
	userID := mw.UserIDFromContext(c)

	newKey, err := generateAPIKey()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate API key")
	}

	if err := h.store.RegenerateAPIKey(c.Request().Context(), userID, newKey); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to update API key")
	}

	return c.JSON(http.StatusOK, map[string]string{"api_key": newKey})
}

// DeleteAccount handles DELETE /v1/settings/account.
// Removes all user data and the user record itself inside a single transaction.
func (h *Handler) DeleteAccount(c echo.Context) error {
	userID := mw.UserIDFromContext(c)

	if err := h.store.DeleteUser(c.Request().Context(), userID); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete account")
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "account deleted"})
}
