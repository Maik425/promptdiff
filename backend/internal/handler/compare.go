package handler

import (
	"net/http"
	"time"

	"github.com/Maik425/promptdiff/internal/middleware"
	"github.com/Maik425/promptdiff/internal/model"
	"github.com/Maik425/promptdiff/internal/service"
	"github.com/labstack/echo/v4"
)

// Compare handles POST /v1/compare.
// It validates the request, checks billing/quota, runs all models in parallel,
// and returns structured comparison results.
func (h *Handler) Compare(c echo.Context) error {
	var req model.CompareRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	if req.Prompt == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "prompt is required")
	}

	if len(req.Models) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "at least one model is required")
	}

	if len(req.Models) > 5 {
		return echo.NewHTTPError(http.StatusBadRequest, "maximum 5 models per eval")
	}

	// Validate that all requested models are supported before doing any work.
	for _, m := range req.Models {
		if _, ok := h.registry.Lookup(m); !ok {
			return echo.NewHTTPError(http.StatusBadRequest, "unsupported model: "+m)
		}
	}

	userID := middleware.UserIDFromContext(c)
	user := middleware.UserFromContext(c)

	// Get current month usage
	month := time.Now().UTC().Format("2006-01")
	var evalCount int
	var monthlySpend float64
	usage, err := h.store.GetUsage(c.Request().Context(), userID, month)
	if err == nil && usage != nil {
		evalCount = usage.EvalCount
		monthlySpend = usage.TotalCostUSD
	}

	// Hybrid billing check
	allowed, reason := service.CanRunEval(
		evalCount,
		user.HasPaymentMethod,
		monthlySpend,
		user.MonthlySpendLimit,
	)
	if !allowed {
		return echo.NewHTTPError(http.StatusPaymentRequired, reason)
	}

	resp, err := h.evalSvc.RunComparison(c.Request().Context(), userID, req)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, resp)
}
