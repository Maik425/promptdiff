# Risks & Mitigations

## Risk 1: LLM Providers Build This Natively

**Probability**: HIGH (12-18 months)
**Impact**: Product becomes redundant

OpenAI, Anthropic, or Google could add "compare with other models" to their playgrounds.

**Mitigation**:
- Ship fast. Extract value in the window.
- If traction, pivot to niche (e.g., domain-specific evals, regression testing)
- Build & Flip: if we hit $2K MRR, we can sell for $50-100K even if the window is closing
- Multi-model is our moat — no single provider will compare against competitors

**Why it's manageable**: No LLM provider will voluntarily show users that a competitor's model is better. Cross-model comparison is structurally unattractive for them to build.

---

## Risk 2: LLM API Cost Margin Gets Squeezed

**Probability**: MEDIUM
**Impact**: Unit economics break

If we charge $0.005/eval but each eval costs $0.01 in API calls, we lose money.

**Mitigation**:
- Pass-through pricing: charge LLM cost + fixed margin per eval
- Cache identical prompts+model combinations (same input → cached output for 1 hour)
- Default to cheapest models (Haiku, GPT-4o-mini, Flash) unless user specifies
- Show cost transparency: users see exactly what they're paying per model

**Current economics (March 2026)**:
- Claude Haiku: ~$0.001/1K input tokens
- GPT-4o-mini: ~$0.00015/1K input tokens
- Gemini Flash: ~$0.0001/1K input tokens
- 3-model eval of a 500-token prompt ≈ $0.002-0.005 in API cost
- Charge $0.005-0.01/eval → 50-80% margin

---

## Risk 3: Nobody Needs This

**Probability**: MEDIUM
**Impact**: Zero traction

Developers might just use ChatGPT vs Claude manually and never feel the need for an API.

**Mitigation**:
- Validate before building: post the concept on X/Twitter, gauge interest
- Dogfood it: use PromptDiff for our own prompt development (X post generator, etc.)
- Target CI/CD use case: "prompt regression testing" is a need that manual comparison can't solve
- If no traction in 90 days → list on Microns.io and move on (Build & Flip)

---

## Risk 4: API Key Security

**Probability**: LOW
**Impact**: HIGH (users' LLM API keys compromised)

Users might provide their own API keys for Anthropic/OpenAI. If we store them insecurely, breach = game over.

**Mitigation**:
- **Option A (recommended for MVP)**: We use OUR API keys. Users pay us. We handle all LLM billing.
- **Option B (later)**: BYOK (Bring Your Own Key). Encrypt at rest, never log, delete after use.
- MVP should be Option A only. Simpler, safer, better unit economics.

---

## Risk 5: Rate Limits from LLM Providers

**Probability**: HIGH
**Impact**: Service degradation

Running 3+ models per eval means 3+ API calls. At scale, we'll hit rate limits.

**Mitigation**:
- Implement per-provider rate limiting and queuing
- Request higher rate limits from providers as usage grows
- Offer async mode: eval runs in background, webhook when done
- Default to smaller/faster models to reduce API load

---

## Risk Matrix

| Risk | Probability | Impact | Priority |
|------|------------|--------|----------|
| Providers build it | HIGH | HIGH | **Monitor** — 18mo window, ship fast |
| Cost margin squeeze | MEDIUM | MEDIUM | **Design** — pass-through pricing from day 1 |
| Nobody needs this | MEDIUM | HIGH | **Validate** — X post + dogfooding before heavy build |
| API key security | LOW | HIGH | **Architecture** — Option A (our keys) for MVP |
| Rate limits | HIGH | MEDIUM | **Engineering** — queuing + async mode |
