// Package provider — Anthropic API client.
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

const anthropicBaseURL = "https://api.anthropic.com/v1/messages"
const anthropicVersion = "2023-06-01"

// anthropicPricing maps model IDs to their per-1M-token prices (USD).
var anthropicPricing = map[string][2]float64{
	// [inputPer1M, outputPer1M]
	"claude-sonnet-4-5": {3.00, 15.00},
	"claude-haiku-4-5":  {0.80, 4.00},
}

// AnthropicProvider implements Provider for Anthropic models.
type AnthropicProvider struct {
	apiKey string
	client *http.Client
}

// NewAnthropicProvider creates a new AnthropicProvider.
func NewAnthropicProvider(apiKey string) *AnthropicProvider {
	return &AnthropicProvider{
		apiKey: apiKey,
		client: &http.Client{Timeout: 120 * time.Second},
	}
}

// Name implements Provider.
func (a *AnthropicProvider) Name() string { return "anthropic" }

// SupportedModels implements Provider.
func (a *AnthropicProvider) SupportedModels() []model.ModelInfo {
	return []model.ModelInfo{
		{
			ID:          "claude-sonnet-4-5",
			Name:        "Claude Sonnet 4.5",
			Provider:    "anthropic",
			InputPer1M:  3.00,
			OutputPer1M: 15.00,
		},
		{
			ID:          "claude-haiku-4-5",
			Name:        "Claude Haiku 4.5",
			Provider:    "anthropic",
			InputPer1M:  0.80,
			OutputPer1M: 4.00,
		},
	}
}

// anthropicMessage is a single turn in the messages array.
type anthropicMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// anthropicRequest is the request body sent to the Anthropic API.
type anthropicRequest struct {
	Model     string             `json:"model"`
	MaxTokens int                `json:"max_tokens"`
	System    string             `json:"system,omitempty"`
	Messages  []anthropicMessage `json:"messages"`
}

type anthropicContent struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

type anthropicUsage struct {
	InputTokens  int `json:"input_tokens"`
	OutputTokens int `json:"output_tokens"`
}

type anthropicResponse struct {
	Content []anthropicContent `json:"content"`
	Usage   anthropicUsage     `json:"usage"`
	Error   *struct {
		Type    string `json:"type"`
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

// Complete implements Provider.
func (a *AnthropicProvider) Complete(ctx context.Context, req CompletionRequest) (*CompletionResult, error) {
	maxTokens := req.MaxTokens
	if maxTokens <= 0 {
		maxTokens = 4096
	}

	var systemPrompt string
	userContent := req.Prompt
	if req.Input != "" {
		systemPrompt = req.Prompt
		userContent = req.Input
	}

	body := anthropicRequest{
		Model:     req.Model,
		MaxTokens: maxTokens,
		System:    systemPrompt,
		Messages: []anthropicMessage{
			{Role: "user", Content: userContent},
		},
	}

	b, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("anthropic: marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, anthropicBaseURL, bytes.NewReader(b))
	if err != nil {
		return nil, fmt.Errorf("anthropic: create request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("x-api-key", a.apiKey)
	httpReq.Header.Set("anthropic-version", anthropicVersion)

	start := time.Now()
	resp, err := a.client.Do(httpReq)
	latencyMs := time.Since(start).Milliseconds()
	if err != nil {
		return nil, fmt.Errorf("anthropic: http request: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("anthropic: read response: %w", err)
	}

	var ar anthropicResponse
	if err := json.Unmarshal(raw, &ar); err != nil {
		return nil, fmt.Errorf("anthropic: decode response: %w", err)
	}

	result := &CompletionResult{
		Model:     req.Model,
		Provider:  "anthropic",
		LatencyMs: latencyMs,
	}

	if ar.Error != nil {
		result.Error = ar.Error.Message
		return result, nil
	}

	if resp.StatusCode != http.StatusOK {
		result.Error = fmt.Sprintf("HTTP %d: %s", resp.StatusCode, string(raw))
		return result, nil
	}

	if len(ar.Content) > 0 {
		result.Output = ar.Content[0].Text
	}

	result.Tokens = model.TokenUsage{
		Input:  ar.Usage.InputTokens,
		Output: ar.Usage.OutputTokens,
		Total:  ar.Usage.InputTokens + ar.Usage.OutputTokens,
	}
	result.CostUSD = calcCost(req.Model, anthropicPricing, ar.Usage.InputTokens, ar.Usage.OutputTokens)

	return result, nil
}

// calcCost computes cost in USD from token counts and a pricing map.
func calcCost(modelID string, pricing map[string][2]float64, inputTokens, outputTokens int) float64 {
	p, ok := pricing[modelID]
	if !ok {
		return 0
	}
	return (float64(inputTokens)/1_000_000)*p[0] + (float64(outputTokens)/1_000_000)*p[1]
}
