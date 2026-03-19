// Package service contains the core business logic for running evaluations.
package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"sync"
	"time"

	"github.com/Maik425/promptdiff/internal/model"
	"github.com/Maik425/promptdiff/internal/provider"
	"github.com/Maik425/promptdiff/internal/store"
)

// EvalService orchestrates parallel model evaluation and persists results.
type EvalService struct {
	registry *provider.Registry
	store    store.Store
}

// NewEvalService creates a new EvalService.
func NewEvalService(registry *provider.Registry, store store.Store) *EvalService {
	return &EvalService{
		registry: registry,
		store:    store,
	}
}

// RunComparison executes the given models in parallel, collects results,
// computes metadata, stores the eval, and updates the user's usage counters.
func (s *EvalService) RunComparison(ctx context.Context, userID string, req model.CompareRequest) (*model.CompareResponse, error) {
	// Validate that every requested model is supported.
	for _, modelID := range req.Models {
		if _, ok := s.registry.Lookup(modelID); !ok {
			return nil, fmt.Errorf("unknown model: %s", modelID)
		}
	}

	temp := 0.0
	maxTokens := 0
	if req.Options != nil {
		temp = req.Options.Temperature
		maxTokens = req.Options.MaxTokens
	}

	// Run all models concurrently.
	type indexedResult struct {
		idx int
		res model.EvalResult
	}

	resultsCh := make(chan indexedResult, len(req.Models))
	var wg sync.WaitGroup

	for i, modelID := range req.Models {
		wg.Add(1)
		go func(idx int, mid string) {
			defer wg.Done()

			p, _ := s.registry.Lookup(mid)
			cr := provider.CompletionRequest{
				Model:       mid,
				Prompt:      req.Prompt,
				Input:       req.Input,
				Temperature: temp,
				MaxTokens:   maxTokens,
			}

			res, err := p.Complete(ctx, cr)
			evalRes := model.EvalResult{}
			if err != nil {
				evalRes = model.EvalResult{
					Model:    mid,
					Provider: p.Name(),
					Error:    err.Error(),
				}
			} else {
				evalRes = model.EvalResult{
					Model:     res.Model,
					Provider:  res.Provider,
					Output:    res.Output,
					LatencyMs: res.LatencyMs,
					Tokens:    res.Tokens,
					CostUSD:   res.CostUSD,
					Error:     res.Error,
				}
			}

			resultsCh <- indexedResult{idx: idx, res: evalRes}
		}(i, modelID)
	}

	// Close channel when all goroutines finish.
	go func() {
		wg.Wait()
		close(resultsCh)
	}()

	// Collect results preserving input order.
	ordered := make([]model.EvalResult, len(req.Models))
	for ir := range resultsCh {
		ordered[ir.idx] = ir.res
	}

	// Compute aggregate metadata.
	meta := computeMeta(ordered)

	// Build and persist the eval record.
	evalID := generateEvalID()
	eval := &model.Eval{
		ID:           evalID,
		UserID:       userID,
		Prompt:       req.Prompt,
		Input:        req.Input,
		Models:       req.Models,
		Options:      req.Options,
		Results:      ordered,
		Meta:         meta,
		TotalCostUSD: meta.TotalCostUSD,
		CreatedAt:    time.Now().UTC(),
	}

	if err := s.store.CreateEval(ctx, eval); err != nil {
		return nil, fmt.Errorf("service: store eval: %w", err)
	}

	// Update monthly usage (best-effort — don't fail the request on counter error).
	month := time.Now().UTC().Format("2006-01")
	_ = s.store.UpsertUsage(ctx, userID, month, 1, meta.TotalCostUSD)

	return &model.CompareResponse{
		EvalID:  evalID,
		Results: ordered,
		Meta:    meta,
	}, nil
}

// computeMeta derives aggregate statistics from a set of results.
func computeMeta(results []model.EvalResult) *model.EvalMeta {
	meta := &model.EvalMeta{}

	var fastestLatency int64 = -1
	var cheapestCost float64 = -1

	for _, r := range results {
		if r.Error != "" {
			continue
		}

		meta.TotalCostUSD += r.CostUSD

		if fastestLatency < 0 || r.LatencyMs < fastestLatency {
			fastestLatency = r.LatencyMs
			meta.FastestModel = r.Model
		}

		if cheapestCost < 0 || r.CostUSD < cheapestCost {
			cheapestCost = r.CostUSD
			meta.CheapestModel = r.Model
		}
	}

	return meta
}

// generateEvalID returns a unique eval identifier in the form eval_<12 alphanum chars>.
func generateEvalID() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return "eval_" + hex.EncodeToString(b)[:12]
}
