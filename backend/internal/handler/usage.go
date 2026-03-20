package handler

import (
	"net/http"
	"time"

	"github.com/Maik425/promptdiff/internal/middleware"
	"github.com/Maik425/promptdiff/internal/service"
	"github.com/labstack/echo/v4"
)

// GetUsage handles GET /v1/usage.
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
	var totalCharge float64
	if usage != nil {
		evalCount = usage.EvalCount
		totalCharge = usage.TotalCostUSD
	}

	freeRemaining := service.FreeQuota - evalCount
	if freeRemaining < 0 {
		freeRemaining = 0
	}

	// Free model list
	freeModels := make([]string, 0, len(service.FreeModels))
	for m := range service.FreeModels {
		freeModels = append(freeModels, m)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"user_id":              userID,
		"month":                month,
		"eval_count":           evalCount,
		"total_charge_usd":     totalCharge,
		"has_payment_method":   user.HasPaymentMethod,
		"monthly_spend_limit":  user.MonthlySpendLimit,
		"free_evals_remaining": freeRemaining,
		"pricing": map[string]interface{}{
			"model":       "pass-through",
			"description": "LLM API cost + 40% margin",
			"margin":      service.Margin,
			"free_quota":  service.FreeQuota,
			"free_models": freeModels,
		},
	})
}
