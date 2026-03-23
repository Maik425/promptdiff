# PromptDiff — Launch Materials

> All copy written in English. Prepared for Product Hunt launch and supporting channels.

---

## 1. Product Hunt Tagline (max 60 chars)

**Option A** (40 chars — clean, direct)
```
Compare LLMs across models. One API call.
```

**Option B** (54 chars — benefit-led)
```
The curl of LLM eval. No platform. No setup.
```

**Option C** (51 chars — pain-led)
```
Stop copy-pasting into ChatGPT. Compare via API.
```

---

## 2. Description (max 260 chars)

**Option A** (241 chars — feature-complete)
```
POST a prompt, get structured scores, latency, cost, and a winner across Claude, GPT-4o, and Gemini — in one API call. No SDK, no dashboard login, no dataset setup. Free tier: 100 evals/month, no card required.
```

**Option B** (215 chars — problem-solution arc)
```
Tired of manually testing prompts across ChatGPT, Claude, and Gemini? PromptDiff runs your prompt against multiple models and returns structured scores, latency, and cost in a single API response.
```

**Option C** (218 chars — developer-voice)
```
One endpoint. Send a prompt + model list. Get back scores, latency, token counts, and a diff summary. The missing eval primitive for developers building with LLMs. Free 100 evals/month, no credit card.
```

---

## 3. Maker Comment (first comment on the PH page)

```
Hey Product Hunt! I'm Maiki — solo developer based in Japan. I built PromptDiff in 2 days as a side project, and I wanted to share the story behind it.

**The problem I kept hitting**

Every time I built something with LLMs, I had the same frustrating workflow: open ChatGPT, paste prompt, copy output into a doc. Switch tab, open Claude, paste again, copy output. Switch tab again. Do the same for Gemini. Then try to compare three walls of text side-by-side and make a judgment call.

There are great observability platforms (Braintrust, LangSmith, PromptLayer) — but they're all *platforms*. They want you to install an SDK, configure a dashboard, upload datasets, and integrate deeply into your codebase. That's overkill when you just want to answer "which model handles this prompt best?"

I wanted something like `curl` — one call, structured output, done.

**What PromptDiff does**

- POST a prompt and a list of models
- Get back: outputs, rubric scores (accuracy, tone, conciseness), latency in ms, token counts, cost in USD, and a natural-language diff summary
- Works with Claude, GPT-4o, Gemini, and more
- No SDK required — plain HTTP
- CI/CD-friendly (JSON in, JSON out)

**Pricing**

Free tier is 100 evals/month with no credit card required. Paid is $0.005/eval (usage-based, no subscription). The monthly spend cap defaults to $50 so there are no surprise bills.

**What I'd love feedback on**

- Is the rubric scoring useful, or is raw output + latency enough?
- What models do you wish were supported?
- Would you use this in CI/CD for prompt regression testing?

Try it at https://promptdiff.bizmarq.com — docs at https://promptdiff.bizmarq.com/docs

Happy to answer any questions below!
```

---

## 4. Topics / Categories

Recommended Product Hunt topics in priority order:

1. **Developer Tools** — primary; this is an API for developers
2. **Artificial Intelligence** — core domain
3. **APIs** — the product is an API product
4. **Open Source** — if applicable to any components
5. **Productivity** — replaces a tedious manual workflow
6. **SaaS** — usage-based SaaS model
7. **Machine Learning** — relevant to eval/benchmarking audience

Primary tags to select on PH: `Developer Tools`, `Artificial Intelligence`, `APIs`

---

## 5. Gallery Descriptions (Screenshot Captions)

**Screenshot 1 — Landing page hero**
```
PromptDiff — Compare LLM outputs across models with a single POST request. No platform setup, no SDK, no credit card.
```

**Screenshot 2 — Playground (side-by-side comparison)**
```
The browser Playground lets you send a prompt to multiple models simultaneously and compare outputs, scores, latency, and cost side-by-side. No API key needed to try it.
```

**Screenshot 3 — API response (JSON)**
```
Structured JSON response includes model output, rubric scores (accuracy, conciseness, tone), latency in milliseconds, token counts, cost in USD, and a natural-language diff summary with a declared winner.
```

**Screenshot 4 — Docs quickstart**
```
Two-minute quickstart: get an API key, send your first comparison, and interpret the response. Works with curl, Python, TypeScript, or any HTTP client.
```

---

## 6. Reddit Posts

### r/SideProject — Show format

**Title:**
```
Show r/SideProject: I built PromptDiff — compare LLM outputs across models with one API call (free tier, no card)
```

**Body:**
```
Hey everyone! I'm a solo dev based in Japan and I built this in 2 days because I was fed up with manually copy-pasting prompts into ChatGPT, Claude, and Gemini to compare outputs.

**PromptDiff** — https://promptdiff.bizmarq.com

**What it does:**
Send one POST request with a prompt and a list of models. You get back:
- The output from each model
- Rubric scores (accuracy, conciseness, tone — configurable)
- Latency in milliseconds
- Token counts and cost in USD per model
- A natural-language diff summary with a declared winner

**Example:**
```json
POST /v1/compare
{
  "prompt": "Summarize in 2 sentences",
  "input": "Long article...",
  "models": ["claude-sonnet-4-6", "gpt-4o", "gemini-2.0-flash"]
}
```

**Why I built it instead of using existing tools:**
Every existing tool (Braintrust, LangSmith, PromptLayer) is a *platform* — SDK installs, dashboards, dataset uploads. I wanted something more like `curl` — one endpoint, structured output, no commitment.

**Pricing:**
Free tier: 100 evals/month, no credit card. Paid: $0.005/eval (usage-based).

**Stack:** Go + PostgreSQL on the backend, Next.js for the frontend, deployed on VPS.

Would love any feedback — especially on whether the rubric scoring approach makes sense or if you'd prefer just raw output + latency.

Docs: https://promptdiff.bizmarq.com/docs
```

---

### r/webdev

**Title:**
```
I built a single-endpoint API to compare LLM outputs across models — sick of copy-pasting into playgrounds
```

**Body:**
```
Built this over a weekend after hitting the same frustration for the 50th time: you want to know which model handles your prompt best, so you open three browser tabs and manually compare walls of text.

**PromptDiff** is a dead-simple API:

```bash
curl -X POST https://api.promptdiff.bizmarq.com/v1/compare \
  -H "Authorization: Bearer pd_xxx" \
  -d '{
    "prompt": "Summarize this in 2 sentences",
    "input": "Article text...",
    "models": ["claude-sonnet-4-6", "gpt-4o", "gemini-2.0-flash"]
  }'
```

Response includes: outputs, rubric scores, latency per model, token counts, cost breakdown, and a diff summary.

**Why not just use LangSmith / Braintrust?**
Those are observability platforms — you need to instrument your code, log to their service, configure datasets. Overkill for "just compare these three models right now."

**The gap I noticed:** No product offers pure eval-as-API. They're all platforms with dashboards and SDKs and $100+/month pricing. This is $0.005/eval or free up to 100/month.

Landing page + playground: https://promptdiff.bizmarq.com
Docs: https://promptdiff.bizmarq.com/docs

Happy to answer questions. Stack is Go + Echo on the backend.
```

---

### r/artificial (or r/MachineLearning)

**Title:**
```
I built an API that runs your prompt across Claude, GPT-4o, and Gemini in parallel and returns structured eval scores — thoughts on the rubric approach?
```

**Body:**
```
Working on a small tool called PromptDiff (https://promptdiff.bizmarq.com) and I'm curious what this community thinks about the evaluation approach.

**The concept:** You POST a prompt + list of models. The API runs them in parallel and returns:
- Raw output per model
- Scores on configurable rubric dimensions (currently: accuracy, conciseness, tone, relevance)
- Latency, token counts, cost per model
- A natural-language diff summary with a "winner" declaration

**The rubric scoring question:**
Currently the scoring is LLM-as-judge — a secondary LLM call evaluates each output against the rubric. This is imperfect (the judge has its own biases, same-model-as-judge is obviously circular), but it gives a structured number.

A few things I'm unsure about:
1. Is LLM-as-judge scoring actually useful for prompt selection decisions, or do people just want raw outputs to read themselves?
2. Should the default be "no rubric, just outputs + latency" with rubric as opt-in?
3. Which eval dimensions matter most to you? (I'm thinking: accuracy, conciseness, tone, faithfulness-to-input, safety)

For context: the target use case is developers during prompt iteration, not academic benchmarking. Think "I'm writing a system prompt for a customer support bot — which model handles edge cases better?"

Free tier is 100 evals/month, no card. Would genuinely love feedback on the eval methodology.

Docs: https://promptdiff.bizmarq.com/docs
```

---

## 7. Hacker News "Show HN" Post

**Title:**
```
Show HN: PromptDiff – Compare LLM outputs across models with one API call
```

**Body:**
```
PromptDiff: https://promptdiff.bizmarq.com
Docs: https://promptdiff.bizmarq.com/docs

I built this because I kept manually copy-pasting prompts into ChatGPT, Claude, and Gemini tabs to compare outputs. The workflow is tedious and produces no structured data.

Existing tools (Braintrust, LangSmith, PromptLayer) are observability platforms — they require SDK installation, code instrumentation, dataset configuration, and monthly subscriptions starting at $39-250. They're designed for production tracing, not quick model selection during development.

PromptDiff is a single endpoint:

  POST /v1/compare
  { "prompt": "...", "input": "...", "models": ["claude-sonnet-4-6", "gpt-4o", "gemini-2.0-flash"] }

Response includes per-model: output, latency_ms, token counts, cost_usd, rubric scores (LLM-as-judge), and a diff_summary with a winner.

The rubric scoring uses a secondary LLM call to evaluate outputs against configurable dimensions (accuracy, conciseness, tone). I'm aware this has limitations — the judge model carries its own biases — but it gives developers a structured number to act on rather than "vibes."

Pricing: free tier is 100 evals/month with no credit card. Paid is $0.005/eval usage-based with a configurable monthly spend cap. No subscription required.

Stack: Go + Echo (backend), PostgreSQL, Next.js (frontend + docs), deployed on VPS with Caddy.

Built as a side project in 2 days. Would appreciate feedback on:
- Is LLM-as-judge useful here or noise?
- Which models should I prioritize adding? (currently: Claude, GPT-4o, Gemini)
- CI/CD integration use case — would you use this for prompt regression testing in a pipeline?
```

---

## 8. IndieHackers "Show" Post

**Title:**
```
Show IH: Built a cross-model LLM eval API in 2 days — PromptDiff
```

**Body:**
```
Hey IH! Solo dev from Japan here. Shipped PromptDiff last week and wanted to share the build story.

**The itch I scratched**

Every time I was iterating on a prompt, I'd waste 10-15 minutes manually testing in three different playgrounds. I couldn't answer "which model is actually better for this use case" with data — just gut feel.

I looked at the existing tools. Braintrust is great but it's a full observability platform ($250/month for teams). LangSmith requires LangChain. PromptLayer is focused on versioning. None of them offer a simple "fire prompt at multiple models, get structured comparison back" API.

**What I built**

PromptDiff (https://promptdiff.bizmarq.com) — a REST API where you POST a prompt + list of models and get back:

- Output per model
- Rubric scores (accuracy, conciseness, tone — LLM-as-judge)
- Latency in ms, token counts, cost in USD
- A natural-language diff summary with a winner

One call. No SDK. No dashboard login. No dataset setup. Works from curl.

**Tech**

Go + Echo backend, PostgreSQL, Next.js for the landing page + docs. Deployed on a $10/month VPS. Total infrastructure cost: ~$15/month.

**Pricing**

Free tier: 100 evals/month, no credit card.
Paid: $0.005/eval (usage-based). Monthly spend cap defaults to $50.

Gross margin on paid tier is ~24% at the standard rate, which isn't amazing — but the free tier acts as the acquisition channel, and margin improves significantly if users default to cheaper models (Haiku, GPT-4o-mini, Flash).

**What I'd love feedback on**

1. Is the LLM-as-judge rubric approach genuinely useful for prompt selection, or does it just add noise?
2. What's the killer use case I'm underweighting? (I'm thinking: CI/CD prompt regression testing, but maybe there's a bigger one)
3. Any IH members using eval tools in your LLM products? What's your current workflow?

Docs: https://promptdiff.bizmarq.com/docs

Happy to answer any questions — this is a Build & Flip project for me, aiming to validate and sell in 12 months, so honest feedback is genuinely useful.
```

---

*Prepared: 2026-03-23*
