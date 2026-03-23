# PromptDiff

Compare LLM outputs across models. One API call.

**Live:** https://promptdiff.bizmarq.com

## What it does

Send a prompt + pick your models → get structured comparison results with output, latency, cost, and tokens for each model. Supports Claude, GPT, Gemini, and Grok.

```bash
curl -X POST https://promptdiff.bizmarq.com/api/v1/compare \
  -H "Authorization: Bearer pd_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is 2+2?",
    "models": ["claude-haiku-4-5", "gpt-4o-mini", "gemini-2.5-flash", "grok-3-mini"]
  }'
```

## Features

- 8 models across 4 providers (Anthropic, OpenAI, Google, Grok)
- Parallel execution — total latency ≈ slowest model
- Cost and token tracking per model
- Free tier: 100 evals/month (no credit card)
- Pay-as-you-go: LLM cost + 40% margin
- Python and TypeScript SDKs
- Playground UI for browser-based comparisons
- Google OAuth + email/password auth

## Stack

- **Backend:** Go + Echo
- **Database:** PostgreSQL
- **Frontend:** Next.js 14+ (App Router, shadcn/ui)
- **Auth:** JWT (dashboard) + API keys (SDK)
- **Payments:** Stripe (hybrid billing)
- **Deploy:** VPS (nginx, Let's Encrypt, systemd)

## Quick Start

```python
from promptdiff import PromptDiff

pd = PromptDiff(api_key="pd_your_key")
result = pd.compare(
    prompt="Explain closures in JavaScript",
    models=["claude-haiku-4-5", "gpt-4o-mini", "gemini-2.5-flash"],
)
for r in result.results:
    print(f"{r.model}: {r.output[:80]}... ({r.latency_ms}ms, ${r.cost_usd:.6f})")
```

## Docs

- [Quickstart](https://promptdiff.bizmarq.com/docs/quickstart)
- [API Reference](https://promptdiff.bizmarq.com/docs/api-reference)
- [Models & Pricing](https://promptdiff.bizmarq.com/docs/models)
- [Examples](https://promptdiff.bizmarq.com/docs/examples)

## SDKs

- **Python:** `sdk/python/` — `from promptdiff import PromptDiff`
- **TypeScript:** `sdk/typescript/` — `import { PromptDiff } from 'promptdiff'`

## License

MIT
