# Competitive Analysis

## Direct Competitors

### None (pure eval-as-API)

No product currently offers a simple "POST a prompt, GET compared results across models" API. This is the core opportunity.

## Adjacent Competitors

### 1. Braintrust

- **What**: LLM observability + eval platform
- **Pricing**: Free tier → $250/month (team)
- **Strengths**: Real-time tracing, dataset management, human eval UI
- **Weakness**: It's a platform, not an API. Requires SDK integration, dashboard login, dataset setup. Overkill for "just compare 3 models"
- **Our angle**: We're 1 API call. They're a platform commitment.

### 2. LangSmith (LangChain)

- **What**: Tracing + eval for LangChain apps
- **Pricing**: Free → $39/seat/month
- **Strengths**: Deep LangChain integration, hub for prompts
- **Weakness**: Tied to LangChain ecosystem. If you don't use LangChain, it's friction. Eval requires dataset setup + custom evaluators.
- **Our angle**: Framework-agnostic. Works with any codebase.

### 3. PromptLayer

- **What**: Prompt versioning + observability
- **Pricing**: Free → $49/month
- **Strengths**: Prompt registry, version tracking, A/B testing UI
- **Weakness**: Focused on prompt management, not cross-model comparison. No built-in "compare across models" feature.
- **Our angle**: We do the comparison. They manage versions.

### 4. Humanloop

- **What**: Prompt engineering platform
- **Pricing**: Free → $99/seat/month
- **Strengths**: Beautiful UI, prompt optimization, eval workflows
- **Weakness**: UI-first. No "fire-and-forget" API for CI/CD. Enterprise-focused pricing.
- **Our angle**: API-first, developer-first, indie-hacker-friendly pricing.

### 5. OpenAI Evals / Anthropic Eval framework

- **What**: Open-source eval frameworks from model providers
- **Strengths**: Free, well-documented
- **Weakness**: Single-model only. OpenAI Evals only tests OpenAI models. Self-hosted, requires infra.
- **Our angle**: Cross-model. Hosted. No infra needed.

## Positioning Map

```
                    API-first
                       ↑
                       |
                  PromptDiff
                       |
  Simple ←─────────────┼──────────────→ Complex
                       |
          PromptLayer  |  Braintrust
                       |  LangSmith
                       |  Humanloop
                       ↓
                   Platform-first
```

## Our Differentiation

| Feature | PromptDiff | Braintrust | LangSmith | PromptLayer |
|---------|-----------|-----------|-----------|-------------|
| Cross-model comparison | **Yes** | Manual | No | No |
| 1 API call to compare | **Yes** | No | No | No |
| No SDK required | **Yes** | No | No | No |
| CI/CD friendly | **Yes** | Partial | Partial | No |
| Cost per model shown | **Yes** | No | No | No |
| Free tier | 100/mo | Yes | Yes | Yes |
| Self-serve pricing | **$29/mo** | $250/mo | $39/seat | $49/mo |

## Key Insight

Every competitor is building a **platform** (dashboards, datasets, team features). Nobody is building a **utility** (one endpoint, structured output, done). We're the `curl` of LLM eval — not the IDE.
