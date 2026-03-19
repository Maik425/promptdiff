package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// ListModels handles GET /v1/models.
// It returns the list of all supported LLM models with their pricing.
func (h *Handler) ListModels(c echo.Context) error {
	models := h.registry.AllModels()
	return c.JSON(http.StatusOK, map[string]interface{}{
		"models": models,
	})
}
