# Documentation Design

## Principles

1. **5分でFirst Eval**: Quickstartを読んだら5分以内にAPIを叩ける
2. **コピペで動く**: 全コード例はそのままコピーして動く
3. **In-app**: 別サイトではなくNext.js内に組み込み。離脱を防ぐ
4. **SEOに効く**: Docsの各ページが検索流入の入口になる

## Page Structure

```
/docs                          # Overview + Quickstart
/docs/api-reference            # 全エンドポイント
/docs/api-reference/compare    # POST /v1/compare
/docs/api-reference/evals      # GET /v1/evals, GET /v1/evals/:id
/docs/api-reference/models     # GET /v1/models
/docs/api-reference/usage      # GET /v1/usage
/docs/api-reference/auth       # POST /v1/auth/signup, login
/docs/models                   # 対応モデル一覧 + 料金
/docs/examples                 # ユースケース別
/docs/examples/ci-cd           # GitHub Actionsでの使い方
/docs/examples/prompt-testing  # プロンプト改善ワークフロー
/docs/errors                   # エラーコード一覧
```

## Content Detail

### `/docs` — Overview + Quickstart

```markdown
# PromptDiff Documentation

PromptDiff compares LLM outputs across models with one API call.

## Quickstart

### 1. Get your API key

Sign up at promptdiff.dev/signup. Your API key will be shown immediately.

### 2. Run your first comparison

curl -X POST https://api.promptdiff.dev/v1/compare \
  -H "Authorization: Bearer pd_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is the capital of France?",
    "models": ["claude-haiku-4-5", "gpt-4o-mini", "gemini-2.0-flash"]
  }'

### 3. Read the results

The response includes each model's output, latency, token count, and cost.
The `meta` field tells you which model was fastest and cheapest.

That's it. No SDK needed. No configuration. Just HTTP.
```

### `/docs/api-reference/compare` — Main Endpoint

```markdown
# POST /v1/compare

Run a prompt across multiple LLM models and get structured comparison results.

## Request

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | `Bearer pd_xxx` |
| Content-Type | Yes | `application/json` |

### Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| prompt | string | Yes | The prompt/instruction to send to each model |
| input | string | No | Additional input text (appended to prompt) |
| models | string[] | Yes | List of model IDs (min 1, max 5) |
| options.temperature | float | No | 0.0-2.0 (default: 0.7) |
| options.max_tokens | int | No | 1-4096 (default: 500) |

### Example

[Full curl + Python + JavaScript examples with copy buttons]

## Response

### Success (200)

[Full JSON schema with descriptions]

### Errors

| Status | Code | Description |
|--------|------|-------------|
| 400 | invalid_request | Missing required fields |
| 401 | unauthorized | Invalid or missing API key |
| 402 | quota_exceeded | Monthly eval limit reached |
| 429 | rate_limited | Too many requests |
| 500 | provider_error | One or more LLM providers failed |

## Notes

- Models are called in parallel. Total latency ≈ slowest model's latency.
- If one model fails, others still return. Check `error` field per result.
- Results are stored for 30 days (accessible via GET /v1/evals/:id).
```

### `/docs/models` — Model List + Pricing

```markdown
# Supported Models

## Anthropic

| Model ID | Description | Input $/1M tok | Output $/1M tok |
|----------|-------------|----------------|-----------------|
| claude-sonnet-4-6 | Best balance of speed and quality | $3.00 | $15.00 |
| claude-haiku-4-5 | Fastest, cheapest Anthropic model | $1.00 | $5.00 |

## OpenAI

| Model ID | Description | Input $/1M tok | Output $/1M tok |
|----------|-------------|----------------|-----------------|
| gpt-4o | Flagship multimodal model | $2.50 | $10.00 |
| gpt-4o-mini | Cost-effective for simpler tasks | $0.15 | $0.60 |

## Google

| Model ID | Description | Input $/1M tok | Output $/1M tok |
|----------|-------------|----------------|-----------------|
| gemini-2.0-flash | Ultra-fast, very cheap | $0.10 | $0.40 |
| gemini-2.0-pro | Higher quality, still fast | $1.25 | $5.00 |

## Cost Estimation

A typical 3-model comparison (500 input tokens, 100 output tokens):
- Claude Sonnet + GPT-4o + Gemini Flash ≈ $0.004
- Claude Haiku + GPT-4o-mini + Gemini Flash ≈ $0.0005

Use the cheapest combo for iteration, expensive models for final validation.
```

### `/docs/examples` — Use Case Examples

```markdown
# Examples

## Prompt A/B Testing

Compare two versions of a prompt to see which produces better results:

[Code example: run version_a and version_b through same models]

## Model Selection for a Feature

Find the best model for your summarization feature:

[Code example: same prompt, all 6 models, compare quality/cost/speed]

## Regression Testing in CI

Add prompt tests to your GitHub Actions workflow:

[Code example: shell script that calls /v1/compare and checks output]
```

### `/docs/errors` — Error Reference

```markdown
# Error Codes

All errors return JSON:

{ "error": { "code": "error_code", "message": "Human-readable message" } }

| HTTP | Code | Description | Fix |
|------|------|-------------|-----|
| 400 | invalid_request | Bad request body | Check required fields |
| 400 | invalid_model | Unknown model ID | See /docs/models |
| 401 | unauthorized | Bad API key | Check Authorization header |
| 402 | quota_exceeded | Monthly limit hit | Upgrade plan or wait |
| 429 | rate_limited | Too many requests | Wait and retry |
| 500 | provider_error | LLM provider failed | Retry; check error per model |
```

## Implementation

### Tech

- MDX files in `frontend/src/content/docs/`
- Next.js App Router: `/docs/[...slug]/page.tsx`
- Render with `next-mdx-remote` or `contentlayer`
- Code blocks: `shiki` for syntax highlighting
- Copy button on all code blocks (client component)

### SEO

Each docs page has:
- `<title>`: e.g. "POST /v1/compare - PromptDiff API Reference"
- `<meta description>`: One-line summary
- Open Graph tags
- Structured data (FAQ schema for common questions)

### Search

MVP: Ctrl+K search with simple full-text match across MDX content.
Post-MVP: Algolia DocSearch (free for open-source/docs).
