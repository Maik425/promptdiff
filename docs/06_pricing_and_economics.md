# Pricing & Unit Economics

## Pricing Tiers

| Plan | Price | Evals/month | Overage |
|------|-------|-------------|---------|
| Free | $0 | 100 | — |
| Pro | $29/month | 5,000 | $0.008/eval |
| Scale | $99/month | 25,000 | $0.005/eval |

## Unit Economics (Per Eval)

### Cost Structure

Assuming a typical eval: 500 input tokens, 100 output tokens, 3 models:

| Model | Input cost | Output cost | Total |
|-------|-----------|-------------|-------|
| Claude Sonnet 4.6 | $0.0015 | $0.0005 | $0.0020 |
| GPT-4o | $0.00125 | $0.0005 | $0.00175 |
| Gemini 2.0 Flash | $0.00005 | $0.00003 | $0.00008 |
| **Total API cost** | | | **$0.0038** |

### Revenue Per Eval

| Plan | Revenue/eval | API cost | Gross margin |
|------|-------------|----------|-------------|
| Free | $0 | $0.0038 | -100% (marketing cost) |
| Pro | $0.0058 ($29/5000) | $0.0038 | **34%** |
| Scale | $0.00396 ($99/25000) | $0.0038 | **4%** |
| Scale overage | $0.005 | $0.0038 | **24%** |

### Improving Margins

1. **Default to cheaper models**: Haiku + GPT-4o-mini + Flash = ~$0.0005/eval → margin jumps to 90%+
2. **Cache identical requests**: same prompt+model → cached for 1 hour
3. **Reduce default model count**: 2 models default, 3+ is premium
4. **Encourage mini models**: pricing page shows "try mini models first"

## Break-Even Analysis

Monthly fixed costs:
- VPS: $10
- Domain: $1
- Misc: $5
- **Total: ~$16/month**

Break-even: 1 Pro customer ($29 > $16) or ~4,200 free-tier evals at cost

## Revenue Targets

| Month | Scenario | MRR |
|-------|---------|-----|
| 1 | 3 Pro users | $87 |
| 3 | 10 Pro + 2 Scale | $488 |
| 6 | 30 Pro + 5 Scale | $1,365 |
| 12 | 100 Pro + 10 Scale | $3,890 |

## Flip Valuation

At $2K MRR (month 8-10 target):
- Microns.io: $24K-48K (12-24x monthly profit)
- Acquire.com: $48K-96K (24-48x monthly profit)
- Flippa: $30K-60K (depending on buyer)

## Comparison with Competitors

| Product | Cheapest paid plan | What you get |
|---------|-------------------|-------------|
| PromptDiff | **$29/month** | 5,000 cross-model evals |
| Braintrust | $250/month | Tracing + eval platform |
| LangSmith | $39/seat/month | LangChain tracing |
| PromptLayer | $49/month | Prompt versioning |
| Humanloop | $99/seat/month | Prompt engineering platform |

We're the cheapest AND the simplest.
