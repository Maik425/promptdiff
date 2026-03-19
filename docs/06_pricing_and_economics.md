# Pricing & Unit Economics

## Pricing Model: Hybrid (Usage-Based + Free Tier)

```
Free:     100 evals/month (no credit card required)
Standard: $0.005/eval (1 - 5,000 evals/month)
Volume:   $0.004/eval (5,001 - 25,000)
Volume+:  $0.003/eval (25,001+)

Monthly spend limit: default $50 (user configurable)
```

### Why Hybrid (not subscriptions)

- Free tier has zero friction (no card, no commitment)
- Pay-as-you-go feels natural for API products (AssemblyAI, Resend model)
- Volume discounts reward growth
- No "plan gap" problem ($0 → $29 is a big jump; $0 → $0.005 is nothing)
- Monthly spend limit prevents surprise bills

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

| Tier | Revenue/eval | API cost | Gross margin |
|------|-------------|----------|-------------|
| Free | $0 | $0.0038 | -100% (marketing cost) |
| Standard | $0.005 | $0.0038 | **24%** |
| Volume | $0.004 | $0.0038 | **5%** |
| Volume+ | $0.003 | $0.0038 | **-21%** (loss leader) |

### Improving Margins

1. **Default to cheaper models**: Haiku + GPT-4o-mini + Flash = ~$0.0005/eval → margin jumps to 90%+
2. **Cache identical requests**: same prompt+model → cached for 1 hour
3. **Reduce default model count**: 2 models default, 3+ costs more
4. **Encourage mini models**: pricing page shows "try mini models first"
5. **Charge per-model**: $0.005 is for 1 model. Each additional model adds cost.

## Break-Even Analysis

Monthly fixed costs:
- VPS: $10 (shared with other services)
- Domain: $0 (bizmarq.com subdomain)
- Misc: $5
- **Total: ~$15/month**

Break-even: ~3,750 paid evals at standard rate ($0.005 × 3,750 = $18.75)
= 1 active user doing ~125 evals/day

## Revenue Targets

| Month | Active paying users | Avg evals/user | Revenue |
|-------|-------------------|----------------|---------|
| 1 | 3 | 500 | $7.50 |
| 3 | 15 | 800 | $60 |
| 6 | 50 | 1,000 | $250 |
| 12 | 200 | 1,500 | $1,500 |

Note: usage-based revenue grows with engagement, not just user count.

## Flip Valuation

At $1.5K MRR (month 12 target):
- Microns.io: $18K-36K (12-24x monthly profit)
- Acquire.com: $36K-72K (24-48x monthly profit)
- Flippa: $20K-40K (depending on buyer)

## Comparison with Competitors

| Product | Cheapest paid | Model | What you get |
|---------|--------------|-------|-------------|
| **PromptDiff** | **$0.005/eval** | **Usage-based** | Cross-model comparison |
| Braintrust | $250/month | Subscription | Tracing + eval platform |
| LangSmith | $39/seat/month | Subscription | LangChain tracing |
| PromptLayer | $49/month | Subscription | Prompt versioning |
| Humanloop | $99/seat/month | Subscription | Prompt engineering |

We're the only usage-based pricing AND the simplest product.
