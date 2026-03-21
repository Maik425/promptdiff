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
func (h *Handler) Compare(c echo.Context) error {
	var req model.CompareRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	if req.Prompt == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "prompt is required")
	}

	// Input size limits — prevent cost abuse
	const maxPromptLen = 32000  // ~8K tokens
	const maxInputLen = 128000  // ~32K tokens
	if len(req.Prompt) > maxPromptLen {
		return echo.NewHTTPError(http.StatusBadRequest, "prompt too long (max 32,000 characters)")
	}
	if len(req.Input) > maxInputLen {
		return echo.NewHTTPError(http.StatusBadRequest, "input too long (max 128,000 characters)")
	}

	if len(req.Models) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "at least one model is required")
	}

	if len(req.Models) > 8 {
		return echo.NewHTTPError(http.StatusBadRequest, "maximum 8 models per eval")
	}

	// Cap max_tokens to prevent cost abuse
	if req.Options != nil && req.Options.MaxTokens > 16384 {
		return echo.NewHTTPError(http.StatusBadRequest, "max_tokens must be <= 16384")
	}

	// Validate models exist
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

	// Billing check — unverified accounts receive a reduced free quota.
	allowed, reason := service.CanRunEval(
		evalCount,
		user.HasPaymentMethod,
		monthlySpend,
		user.MonthlySpendLimit,
		user.EmailVerified,
	)
	if !allowed {
		return echo.NewHTTPError(http.StatusPaymentRequired, reason)
	}

	// Free tier: restrict to cheap models only
	if !user.HasPaymentMethod {
		for _, m := range req.Models {
			if !service.IsFreeModel(m) {
				return echo.NewHTTPError(http.StatusPaymentRequired,
					"model "+m+" requires a payment method. Free tier supports: claude-haiku-4-5, gpt-4o-mini, gemini-2.5-flash, grok-3-mini")
			}
		}
	}

	resp, err := h.evalSvc.RunComparison(c.Request().Context(), userID, req, evalCount, user.HasPaymentMethod)
	if err != nil {
		// Don't leak internal error details to the client
		c.Logger().Errorf("compare error for user %s: %v", userID, err)
		return echo.NewHTTPError(http.StatusInternalServerError, "comparison failed. Please try again.")
	}

	return c.JSON(http.StatusOK, resp)
}
