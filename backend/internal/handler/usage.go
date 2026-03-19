package handler

import (
	"net/http"
	"time"

	"github.com/Maik425/promptdiff/internal/middleware"
	"github.com/Maik425/promptdiff/internal/service"
	"github.com/labstack/echo/v4"
)

// GetUsage handles GET /v1/usage.
// Returns current month usage + billing info for the authenticated user.
func (h *Handler) GetUsage(c echo.Context) error {
	userID := middleware.UserIDFromContext(c)
	user := middleware.UserFromContext(c)

	month := c.QueryParam("month")
	if month == "" {
		month = time.Now().UTC().Format("2006-01")
	}

	usage, err := h.store.GetUsage(c.Request().Context(), userID, month)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get usage")
	}

	var evalCount int
	var totalCost float64
	if usage != nil {
		evalCount = usage.EvalCount
		totalCost = usage.TotalCostUSD
	}

	// Compute billing info
	tier, rate := service.PricingTier(evalCount)
	freeRemaining := service.FreeQuota - evalCount
	if freeRemaining < 0 {
		freeRemaining = 0
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"user_id":              userID,
		"month":                month,
		"eval_count":           evalCount,
		"total_cost_usd":       totalCost,
		"has_payment_method":   user.HasPaymentMethod,
		"monthly_spend_limit":  user.MonthlySpendLimit,
		"free_evals_remaining": freeRemaining,
		"current_tier":         tier,
		"current_rate_usd":     rate,
		"pricing": map[string]interface{}{
			"free_quota":          service.FreeQuota,
			"standard_rate":       service.RateStandard,
			"volume_5k_rate":      service.RateVolume5K,
			"volume_25k_rate":     service.RateVolume25K,
		},
	})
}
