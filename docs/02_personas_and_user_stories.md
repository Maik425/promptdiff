# Personas & User Stories

## Persona 1: Solo AI Developer (Primary)

**Name**: Yuki - Indie hacker / freelance developer
**Background**: Builds AI-powered tools and automations. Uses Claude Code daily. Ships fast.
**Pain**: Switching between ChatGPT, Claude, Gemini playgrounds to compare outputs. No structured data to decide which model to use for a feature.

### User Stories

- As Yuki, I want to **compare prompt outputs across 3 models with one API call**, so I don't waste time copy-pasting between playgrounds.
- As Yuki, I want to **get a cost breakdown per model**, so I can pick the cheapest model that meets my quality bar.
- As Yuki, I want to **save eval results and track prompt improvements over time**, so I know if my prompt changes are actually better.
- As Yuki, I want to **run evals from my CI pipeline**, so prompt regressions get caught before deploy.

---

## Persona 2: Startup AI Engineer

**Name**: Alex - Engineer at a 10-50 person startup
**Background**: Building an AI feature (summarization, classification, extraction). Needs to justify model choice to the team lead.
**Pain**: "We use GPT-4o because that's what we started with." No data-driven comparison. Switching models is scary because no regression tests.

### User Stories

- As Alex, I want to **benchmark our prompts across models monthly**, so we catch when a cheaper model becomes good enough.
- As Alex, I want to **define custom rubrics** (domain-specific), so evals reflect what matters for our product.
- As Alex, I want to **share eval reports with my team**, so model decisions are data-driven.
- As Alex, I want to **set up automated weekly evals**, so we notice when model providers ship updates that affect our outputs.

---

## Persona 3: AI Tool Builder (MCP/Agent developer)

**Name**: Kai - Building MCP servers or AI agent tools
**Background**: Creates tools that integrate with Claude Code, Cursor, or custom agents. Needs the best model for each tool's purpose.
**Pain**: Each MCP tool might work better with a different model. No way to test systematically.

### User Stories

- As Kai, I want to **eval tool-use prompts** (function calling, structured output), so I know which model follows my schema most reliably.
- As Kai, I want to **test with real tool_use format** (not just plain text), so my evals match production behavior.
- As Kai, I want to **compare structured output accuracy**, so I can pick the model with the lowest JSON parse failure rate.

---

## Non-Personas (Who this is NOT for)

- **Enterprise ML teams**: They have internal eval infra. We don't compete with their custom systems.
- **Researchers**: They need academic-grade benchmarks (MMLU, HumanEval). We're for practical, product-level evals.
- **Non-developers**: This is an API-first product. If you can't write code, this isn't for you.
