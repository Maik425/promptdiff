package handler

import (
	"net/http"
	"time"

	"github.com/Maik425/promptdiff/internal/middleware"
	"github.com/labstack/echo/v4"
)

// GetUsage handles GET /v1/usage.
// It returns the current month's usage statistics for the authenticated user.
func (h *Handler) GetUsage(c echo.Context) error {
	userID := middleware.UserIDFromContext(c)

	// Default to current month; allow ?month=2026-03 override.
	month := c.QueryParam("month")
	if month == "" {
		month = time.Now().UTC().Format("2006-01")
	}

	usage, err := h.store.GetUsage(c.Request().Context(), userID, month)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get usage")
	}

	return c.JSON(http.StatusOK, usage)
}
