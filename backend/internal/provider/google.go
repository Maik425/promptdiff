// Package provider — Google AI (Gemini) API client.
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

const googleAIBaseURL = "https://generativelanguage.googleapis.com/v1beta/models"

var googlePricing = map[string][2]float64{
	"gemini-2.5-flash": {0.15, 0.60},
	"gemini-2.5-pro":   {1.25, 10.00},
}

// GoogleProvider implements Provider for Google Gemini models.
type GoogleProvider struct {
	apiKey string
	client *http.Client
}

// NewGoogleProvider creates a new GoogleProvider.
func NewGoogleProvider(apiKey string) *GoogleProvider {
	return &GoogleProvider{
		apiKey: apiKey,
		client: &http.Client{Timeout: 120 * time.Second},
	}
}

// Name implements Provider.
func (g *GoogleProvider) Name() string { return "google" }

// SupportedModels implements Provider.
func (g *GoogleProvider) SupportedModels() []model.ModelInfo {
	return []model.ModelInfo{
		{
			ID:          "gemini-2.5-flash",
			Name:        "Gemini 2.5 Flash",
			Provider:    "google",
			InputPer1M:  0.15,
			OutputPer1M: 0.60,
		},
		{
			ID:          "gemini-2.5-pro",
			Name:        "Gemini 2.5 Pro",
			Provider:    "google",
			InputPer1M:  1.25,
			OutputPer1M: 10.00,
		},
	}
}

type googlePart struct {
	Text string `json:"text"`
}

type googleContent struct {
	Role  string       `json:"role,omitempty"`
	Parts []googlePart `json:"parts"`
}

type googleGenerationConfig struct {
	Temperature     float64 `json:"temperature,omitempty"`
	MaxOutputTokens int     `json:"maxOutputTokens,omitempty"`
}

type googleRequest struct {
	Contents         []googleContent        `json:"contents"`
	SystemInstruction *googleContent        `json:"systemInstruction,omitempty"`
	GenerationConfig  *googleGenerationConfig `json:"generationConfig,omitempty"`
}

type googleCandidate struct {
	Content googleContent `json:"content"`
}

type googleTokenMetadata struct {
	TotalTokenCount int `json:"totalTokenCount"`
}

type googleUsage struct {
	PromptTokenCount     int `json:"promptTokenCount"`
	CandidatesTokenCount int `json:"candidatesTokenCount"`
	TotalTokenCount      int `json:"totalTokenCount"`
}

type googleResponse struct {
	Candidates    []googleCandidate `json:"candidates"`
	UsageMetadata googleUsage       `json:"usageMetadata"`
	Error         *struct {
		Message string `json:"message"`
		Code    int    `json:"code"`
	} `json:"error,omitempty"`
}

// Complete implements Provider.
func (g *GoogleProvider) Complete(ctx context.Context, req CompletionRequest) (*CompletionResult, error) {
	url := fmt.Sprintf("%s/%s:generateContent?key=%s", googleAIBaseURL, req.Model, g.apiKey)

	body := googleRequest{
		Contents: []googleContent{
			{
				Role:  "user",
				Parts: []googlePart{{Text: func() string {
					if req.Input != "" {
						return req.Input
					}
					return req.Prompt
				}()}},
			},
		},
	}

	if req.Input != "" {
		body.SystemInstruction = &googleContent{
			Parts: []googlePart{{Text: req.Prompt}},
		}
	}

	if req.Temperature > 0 || req.MaxTokens > 0 {
		cfg := &googleGenerationConfig{}
		if req.Temperature > 0 {
			cfg.Temperature = req.Temperature
		}
		if req.MaxTokens > 0 {
			cfg.MaxOutputTokens = req.MaxTokens
		}
		body.GenerationConfig = cfg
	}

	b, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("google: marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(b))
	if err != nil {
		return nil, fmt.Errorf("google: create request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	start := time.Now()
	resp, err := g.client.Do(httpReq)
	latencyMs := time.Since(start).Milliseconds()
	if err != nil {
		return nil, fmt.Errorf("google: http request: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("google: read response: %w", err)
	}

	var gr googleResponse
	if err := json.Unmarshal(raw, &gr); err != nil {
		return nil, fmt.Errorf("google: decode response: %w", err)
	}

	result := &CompletionResult{
		Model:     req.Model,
		Provider:  "google",
		LatencyMs: latencyMs,
	}

	if gr.Error != nil {
		result.Error = gr.Error.Message
		return result, nil
	}

	if resp.StatusCode != http.StatusOK {
		result.Error = fmt.Sprintf("HTTP %d: %s", resp.StatusCode, string(raw))
		return result, nil
	}

	if len(gr.Candidates) > 0 && len(gr.Candidates[0].Content.Parts) > 0 {
		result.Output = gr.Candidates[0].Content.Parts[0].Text
	}

	result.Tokens = model.TokenUsage{
		Input:  gr.UsageMetadata.PromptTokenCount,
		Output: gr.UsageMetadata.CandidatesTokenCount,
		Total:  gr.UsageMetadata.TotalTokenCount,
	}
	result.CostUSD = calcCost(req.Model, googlePricing, gr.UsageMetadata.PromptTokenCount, gr.UsageMetadata.CandidatesTokenCount)

	return result, nil
}
