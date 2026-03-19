package handler

import (
	"net/http"

	"github.com/Maik425/promptdiff/internal/middleware"
	"github.com/Maik425/promptdiff/internal/model"
	"github.com/labstack/echo/v4"
)

// Compare handles POST /v1/compare.
// It validates the request, runs all models in parallel via EvalService,
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

	// Validate that all requested models are supported before doing any work.
	for _, m := range req.Models {
		if _, ok := h.registry.Lookup(m); !ok {
			return echo.NewHTTPError(http.StatusBadRequest, "unsupported model: "+m)
		}
	}

	userID := middleware.UserIDFromContext(c)

	resp, err := h.evalSvc.RunComparison(c.Request().Context(), userID, req)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, resp)
}
