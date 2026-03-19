# PromptDiff - Product Overview

## One-liner

**PromptDiff**: API that compares LLM outputs across models. Post a prompt, get a structured diff.

## Problem

Developers building with LLMs face a recurring pain:

1. "Is this prompt better than the last one?" — No structured way to measure
2. "Which model works best for this task?" — Manual copy-paste across playgrounds
3. "Did my prompt regression break anything?" — No CI-friendly eval tool
4. "How do I justify model choice to my team?" — No data, just vibes

Current tools (LangSmith, Braintrust, PromptLayer) are **tracing/observability** platforms — they watch what happened in production. None offer a simple **"run this prompt across N models and compare"** API.

## Solution

A dead-simple API:

```
POST /v1/compare
{
  "prompt": "Summarize this article in 2 sentences",
  "input": "Article text here...",
  "models": ["claude-sonnet-4-6", "gpt-4o", "gemini-2.0-flash"],
  "rubric": ["accuracy", "conciseness", "tone"]
}

→ Response:
{
  "results": [
    {
      "model": "claude-sonnet-4-6",
      "output": "...",
      "scores": {"accuracy": 0.92, "conciseness": 0.88, "tone": 0.95},
      "latency_ms": 1200,
      "tokens": {"input": 450, "output": 82},
      "cost_usd": 0.0034
    },
    ...
  ],
  "winner": "claude-sonnet-4-6",
  "diff_summary": "Claude scored highest on accuracy and tone. GPT-4o was 15% faster."
}
```

## Why Now

- LLM API prices dropped 80% in 2025-2026 → running evals across multiple models is cheap
- 84% of developers use AI tools; only 24% design for AI agent consumption
- No pure eval-as-API exists. The gap is structural, not timing.
- MCP ecosystem growth means more tools need programmatic model comparison

## Business Model

- **Free**: 100 evals/month
- **Pro**: $29/month (5,000 evals)
- **Scale**: $0.005/eval (usage-based)
- LLM API costs are pass-through + margin (~30-50% markup)

## Tech Stack

- **Backend**: Go + Echo
- **Database**: PostgreSQL (eval history, API keys)
- **LLM Routing**: Direct API calls to Anthropic, OpenAI, Google
- **Frontend**: Next.js (landing page + dashboard)
- **Deploy**: VPS (initial) → Fly.io (scale)
- **SDK**: Python + TypeScript

## Key Metrics

- Monthly Active API Users
- Evals per day
- Revenue per user
- Model provider cost ratio (revenue vs API cost)
