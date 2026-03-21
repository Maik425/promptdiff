package handler

import (
	"net/http"

	"github.com/Maik425/promptdiff/internal/middleware"
	"github.com/labstack/echo/v4"
)

// adminEmail is the system administrator email.
const adminEmail = "takano@bizmarq.com"

// AdminOnly is middleware that restricts access to the admin user.
func AdminOnly() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			user := middleware.UserFromContext(c)
			if user == nil || user.Email != adminEmail {
				return echo.NewHTTPError(http.StatusForbidden, "admin access required")
			}
			return next(c)
		}
	}
}

// AdminListUsers handles GET /v1/admin/users.
// Returns all users with their usage stats.
func (h *Handler) AdminListUsers(c echo.Context) error {
	ctx := c.Request().Context()

	// Get all users from DB
	rows, err := h.store.ListAllUsers(ctx)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to list users")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"users": rows,
		"total": len(rows),
	})
}

// AdminVerifyEmail handles POST /v1/admin/users/:id/verify.
// Sets email_verified = true for a user.
func (h *Handler) AdminVerifyEmail(c echo.Context) error {
	userID := c.Param("id")
	if userID == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "user ID required")
	}

	if err := h.store.SetEmailVerified(c.Request().Context(), userID, true); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to verify email")
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "email verified"})
}

// AdminUpdatePlan handles PUT /v1/admin/users/:id/plan.
// Changes a user's plan.
func (h *Handler) AdminUpdatePlan(c echo.Context) error {
	userID := c.Param("id")
	var req struct {
		Plan string `json:"plan"`
	}
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request")
	}
	if req.Plan != "free" && req.Plan != "pro" && req.Plan != "scale" {
		return echo.NewHTTPError(http.StatusBadRequest, "plan must be free, pro, or scale")
	}

	if err := h.store.UpdatePlan(c.Request().Context(), userID, req.Plan); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to update plan")
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "plan updated"})
}

// AdminGetUsage handles GET /v1/admin/usage.
// Returns aggregate usage across all users.
func (h *Handler) AdminGetUsage(c echo.Context) error {
	stats, err := h.store.GetGlobalUsage(c.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get usage")
	}
	return c.JSON(http.StatusOK, stats)
}
