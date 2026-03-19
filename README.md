# PromptDiff

Compare LLM outputs across models. One API call.

```bash
curl -X POST https://api.promptdiff.dev/v1/compare \
  -H "Authorization: Bearer pd_xxx" \
  -d '{
    "prompt": "Summarize this in 2 sentences",
    "input": "Article text...",
    "models": ["claude-sonnet-4-6", "gpt-4o", "gemini-2.0-flash"]
  }'
```

## Status

**Pre-launch** — Building MVP

## Stack

- Backend: Go + Echo
- Database: PostgreSQL
- Frontend: Next.js (landing page)
- Deploy: VPS

## Docs

- [Product Overview](docs/01_product_overview.md)
- [Personas & User Stories](docs/02_personas_and_user_stories.md)
- [Competitive Analysis](docs/03_competitive_analysis.md)
- [Risks & Mitigations](docs/04_risks_and_mitigations.md)
- [MVP Scope](docs/05_mvp_scope.md)
- [Pricing & Economics](docs/06_pricing_and_economics.md)
