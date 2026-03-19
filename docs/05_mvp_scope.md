# MVP Scope

## Goal

Ship a working API in 2 weeks that lets you compare prompt outputs across 3 LLM providers.

## MVP Features (Must Have)

### API Endpoint

```
POST /v1/compare
```

**Request:**
```json
{
  "prompt": "Summarize this article in 2 sentences",
  "input": "Article text here...",
  "models": ["claude-sonnet-4-6", "gpt-4o", "gemini-2.0-flash"],
  "options": {
    "temperature": 0.7,
    "max_tokens": 500
  }
}
```

**Response:**
```json
{
  "id": "eval_abc123",
  "created_at": "2026-03-20T10:00:00Z",
  "results": [
    {
      "model": "claude-sonnet-4-6",
      "provider": "anthropic",
      "output": "The article discusses...",
      "latency_ms": 1200,
      "tokens": {"input": 450, "output": 82, "total": 532},
      "cost_usd": 0.0034,
      "error": null
    },
    {
      "model": "gpt-4o",
      "provider": "openai",
      "output": "This piece covers...",
      "latency_ms": 980,
      "tokens": {"input": 448, "output": 76, "total": 524},
      "cost_usd": 0.0028,
      "error": null
    },
    {
      "model": "gemini-2.0-flash",
      "provider": "google",
      "output": "The article explains...",
      "latency_ms": 650,
      "tokens": {"input": 445, "output": 70, "total": 515},
      "cost_usd": 0.0002,
      "error": null
    }
  ],
  "meta": {
    "total_cost_usd": 0.0064,
    "fastest_model": "gemini-2.0-flash",
    "cheapest_model": "gemini-2.0-flash"
  }
}
```

### Supported Models (MVP)

| Provider | Models |
|----------|--------|
| Anthropic | claude-sonnet-4-6, claude-haiku-4-5 |
| OpenAI | gpt-4o, gpt-4o-mini |
| Google | gemini-2.0-flash, gemini-2.0-pro |

### Auth

- API key based (`Authorization: Bearer pd_xxx`)
- Keys generated via simple signup (email + password)
- Free tier: 100 evals/month (no credit card)

### Other MVP Endpoints

```
GET  /v1/models          # List supported models + pricing
GET  /v1/evals           # List past evals (paginated)
GET  /v1/evals/:id       # Get single eval result
GET  /v1/usage           # Current month usage + remaining quota
POST /v1/auth/signup     # Create account
POST /v1/auth/login      # Get API key
```

## NOT in MVP (Post-Launch)

- Auto-scoring / rubric-based evaluation
- Structured output / tool_use comparison
- CI/CD integration (GitHub Actions)
- Team features / shared workspaces
- Async mode with webhooks
- Custom model endpoints (self-hosted LLMs)
- Python/TypeScript SDK (use curl/fetch for MVP)
- Dashboard UI (API-only for MVP)

## Architecture (MVP)

```
Client
  ↓ POST /v1/compare
Go API (Echo)
  ├→ Anthropic API
  ├→ OpenAI API       (parallel goroutines)
  └→ Google AI API
  ↓ aggregate results
PostgreSQL (store eval + usage)
  ↓
Response JSON
```

## Deploy

- VPS ($10/month) — same Vultr instance as other services
- PostgreSQL — reuse existing eastflow-db or create new DB
- Reverse proxy: Caddy (auto HTTPS)
- Domain: promptdiff.dev (check availability)

## Timeline

| Week | Deliverable |
|------|------------|
| Week 1 | API scaffold, LLM routing, /v1/compare endpoint, auth |
| Week 2 | Usage tracking, rate limiting, landing page, deploy |
| Week 2+ | First X post about it, Product Hunt prep |

## Success Criteria (90 days)

- [ ] 50+ API signups
- [ ] 10+ active users (at least 1 eval/week)
- [ ] $100+ MRR
- [ ] If criteria not met → list on Microns.io / Flippa
