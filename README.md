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
- Frontend: Next.js (Dashboard + Docs + LP)
- Deploy: VPS (Caddy reverse proxy)

## Docs

### Research & Planning
- [Product Overview](docs/01_product_overview.md)
- [Personas & User Stories](docs/02_personas_and_user_stories.md)
- [Competitive Analysis](docs/03_competitive_analysis.md)
- [Risks & Mitigations](docs/04_risks_and_mitigations.md)

### Design
- [MVP Scope](docs/05_mvp_scope.md)
- [Pricing & Economics](docs/06_pricing_and_economics.md)
- [Dashboard Design](docs/07_dashboard_design.md)
- [Docs Design](docs/08_docs_design.md)
- [Pitch Deck (PDF)](docs/PromptDiff_Pitch.pdf)
