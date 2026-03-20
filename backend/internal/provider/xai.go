// Package provider — xAI (Grok) API client.
// Uses OpenAI-compatible API format.
package provider

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/Maik425/promptdiff/internal/model"
)

const xaiBaseURL = "https://api.x.ai/v1/chat/completions"

var xaiPricing = map[string][2]float64{
	// [inputPer1M, outputPer1M]
	"grok-2":      {2.00, 10.00},
	"grok-2-mini": {0.10, 0.25},
}

// XAIProvider implements Provider for xAI (Grok) models.
type XAIProvider struct {
	apiKey string
	client *http.Client
}

// NewXAIProvider creates a new XAIProvider.
func NewXAIProvider(apiKey string) *XAIProvider {
	return &XAIProvider{
		apiKey: apiKey,
		client: &http.Client{Timeout: 120 * time.Second},
	}
}

// Name implements Provider.
func (x *XAIProvider) Name() string { return "xai" }

// SupportedModels implements Provider.
func (x *XAIProvider) SupportedModels() []model.ModelInfo {
	return []model.ModelInfo{
		{
			ID:          "grok-2",
			Name:        "Grok 2",
			Provider:    "xai",
			InputPer1M:  2.00,
			OutputPer1M: 10.00,
		},
		{
			ID:          "grok-2-mini",
			Name:        "Grok 2 Mini",
			Provider:    "xai",
			InputPer1M:  0.10,
			OutputPer1M: 0.25,
		},
	}
}

// Complete implements Provider.
func (x *XAIProvider) Complete(ctx context.Context, req CompletionRequest) (*CompletionResult, error) {
	maxTokens := req.MaxTokens
	if maxTokens <= 0 {
		maxTokens = 4096
	}

	var messages []openAIMessage
	if req.Input != "" {
		messages = []openAIMessage{
			{Role: "system", Content: req.Prompt},
			{Role: "user", Content: req.Input},
		}
	} else {
		messages = []openAIMessage{
			{Role: "user", Content: req.Prompt},
		}
	}

	body := openAIRequest{
		Model:       req.Model,
		Messages:    messages,
		Temperature: req.Temperature,
		MaxTokens:   maxTokens,
	}

	b, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("xai: marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, xaiBaseURL, bytes.NewReader(b))
	if err != nil {
		return nil, fmt.Errorf("xai: create request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+x.apiKey)

	start := time.Now()
	resp, err := x.client.Do(httpReq)
	latencyMs := time.Since(start).Milliseconds()
	if err != nil {
		return nil, fmt.Errorf("xai: http request: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("xai: read response: %w", err)
	}

	var or openAIResponse
	if err := json.Unmarshal(raw, &or); err != nil {
		return nil, fmt.Errorf("xai: decode response: %w", err)
	}

	result := &CompletionResult{
		Model:     req.Model,
		Provider:  "xai",
		LatencyMs: latencyMs,
	}

	if or.Error != nil {
		result.Error = or.Error.Message
		return result, nil
	}

	if resp.StatusCode != http.StatusOK {
		result.Error = fmt.Sprintf("HTTP %d: %s", resp.StatusCode, string(raw))
		return result, nil
	}

	if len(or.Choices) > 0 {
		result.Output = or.Choices[0].Message.Content
	}

	result.Tokens = model.TokenUsage{
		Input:  or.Usage.PromptTokens,
		Output: or.Usage.CompletionTokens,
		Total:  or.Usage.TotalTokens,
	}
	result.CostUSD = calcCost(req.Model, xaiPricing, or.Usage.PromptTokens, or.Usage.CompletionTokens)

	return result, nil
}
