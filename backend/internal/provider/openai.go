// Package provider — OpenAI API client.
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

const openAIBaseURL = "https://api.openai.com/v1/chat/completions"

var openAIPricing = map[string][2]float64{
	"gpt-4o":      {5.00, 15.00},
	"gpt-4o-mini": {0.15, 0.60},
}

// OpenAIProvider implements Provider for OpenAI models.
type OpenAIProvider struct {
	apiKey string
	client *http.Client
}

// NewOpenAIProvider creates a new OpenAIProvider.
func NewOpenAIProvider(apiKey string) *OpenAIProvider {
	return &OpenAIProvider{
		apiKey: apiKey,
		client: &http.Client{Timeout: 120 * time.Second},
	}
}

// Name implements Provider.
func (o *OpenAIProvider) Name() string { return "openai" }

// SupportedModels implements Provider.
func (o *OpenAIProvider) SupportedModels() []model.ModelInfo {
	return []model.ModelInfo{
		{
			ID:          "gpt-4o",
			Name:        "GPT-4o",
			Provider:    "openai",
			InputPer1M:  5.00,
			OutputPer1M: 15.00,
		},
		{
			ID:          "gpt-4o-mini",
			Name:        "GPT-4o Mini",
			Provider:    "openai",
			InputPer1M:  0.15,
			OutputPer1M: 0.60,
		},
	}
}

type openAIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type openAIRequest struct {
	Model       string          `json:"model"`
	Messages    []openAIMessage `json:"messages"`
	Temperature float64         `json:"temperature,omitempty"`
	MaxTokens   int             `json:"max_tokens,omitempty"`
}

type openAIChoice struct {
	Message openAIMessage `json:"message"`
}

type openAIUsage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

type openAIResponse struct {
	Choices []openAIChoice `json:"choices"`
	Usage   openAIUsage    `json:"usage"`
	Error   *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

// Complete implements Provider.
func (o *OpenAIProvider) Complete(ctx context.Context, req CompletionRequest) (*CompletionResult, error) {
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
		return nil, fmt.Errorf("openai: marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, openAIBaseURL, bytes.NewReader(b))
	if err != nil {
		return nil, fmt.Errorf("openai: create request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+o.apiKey)

	start := time.Now()
	resp, err := o.client.Do(httpReq)
	latencyMs := time.Since(start).Milliseconds()
	if err != nil {
		return nil, fmt.Errorf("openai: http request: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("openai: read response: %w", err)
	}

	var or openAIResponse
	if err := json.Unmarshal(raw, &or); err != nil {
		return nil, fmt.Errorf("openai: decode response: %w", err)
	}

	result := &CompletionResult{
		Model:     req.Model,
		Provider:  "openai",
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
	result.CostUSD = calcCost(req.Model, openAIPricing, or.Usage.PromptTokens, or.Usage.CompletionTokens)

	return result, nil
}
