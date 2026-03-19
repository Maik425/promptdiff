package handler

import (
	"net/http"
	"strconv"

	"github.com/Maik425/promptdiff/internal/middleware"
	"github.com/Maik425/promptdiff/internal/model"
	"github.com/Maik425/promptdiff/internal/store"
	"github.com/labstack/echo/v4"
)

// ListEvals handles GET /v1/evals.
// It returns a paginated list of the authenticated user's past evaluations.
func (h *Handler) ListEvals(c echo.Context) error {
	userID := middleware.UserIDFromContext(c)

	limit := 20
	offset := 0

	if l := c.QueryParam("limit"); l != "" {
		v, err := strconv.Atoi(l)
		if err == nil && v > 0 && v <= 100 {
			limit = v
		}
	}

	if o := c.QueryParam("offset"); o != "" {
		v, err := strconv.Atoi(o)
		if err == nil && v >= 0 {
			offset = v
		}
	}

	evals, err := h.store.ListEvals(c.Request().Context(), userID, limit, offset)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to list evals")
	}

	// Return an empty array rather than null.
	if evals == nil {
		evals = []model.Eval{}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"evals":  evals,
		"limit":  limit,
		"offset": offset,
	})
}

// GetEval handles GET /v1/evals/:id.
// It returns a single evaluation belonging to the authenticated user.
func (h *Handler) GetEval(c echo.Context) error {
	userID := middleware.UserIDFromContext(c)
	evalID := c.Param("id")

	eval, err := h.store.GetEval(c.Request().Context(), evalID, userID)
	if err != nil {
		if err == store.ErrNotFound {
			return echo.NewHTTPError(http.StatusNotFound, "eval not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get eval")
	}

	return c.JSON(http.StatusOK, eval)
}
