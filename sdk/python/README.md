# promptdiff-python

Compare LLM outputs across models. One API call.

## Install

```bash
pip install promptdiff
```

## Quick start

```python
from promptdiff import PromptDiff

pd = PromptDiff(api_key="pd_xxx")

result = pd.compare(
    prompt="Summarize this article in 2 sentences",
    models=["claude-haiku-4-5", "gpt-4o", "gemini-2.0-flash"],
)

for r in result.results:
    print(f"{r.model}: {r.output}")
```

## API reference

### `PromptDiff(api_key, base_url?, timeout?)`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `api_key` | `str` | required | Your API key (`pd_xxx`) |
| `base_url` | `str` | `https://promptdiff.bizmarq.com/api` | Override for self-hosted instances |
| `timeout` | `float` | `60.0` | Request timeout in seconds |

The client can be used as a context manager for automatic connection cleanup:

```python
with PromptDiff(api_key="pd_xxx") as pd:
    result = pd.compare(...)
```

---

### `pd.compare(prompt, models, input?, temperature?, max_tokens?) → CompareResponse`

Run a prompt across multiple models simultaneously.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prompt` | `str` | required | Instruction sent to every model |
| `models` | `List[str]` | required | Model IDs to compare |
| `input` | `str` | `None` | Optional context appended to the prompt |
| `temperature` | `float` | `0.7` | Sampling temperature (0.0–1.0) |
| `max_tokens` | `int` | `500` | Max tokens each model may generate |

```python
result = pd.compare(
    prompt="Explain this code",
    input="def fib(n): return n if n < 2 else fib(n-1) + fib(n-2)",
    models=["claude-haiku-4-5", "gpt-4o-mini"],
    temperature=0.3,
    max_tokens=300,
)

print(result.eval_id)                        # "eval_abc123"

for r in result.results:
    print(r.model)                           # "claude-haiku-4-5"
    print(r.provider)                        # "anthropic"
    print(r.output)                          # model response text
    print(r.latency_ms)                      # 423
    print(r.tokens.input, r.tokens.output)   # 48  91
    print(r.cost_usd)                        # 0.000031
    print(r.error)                           # None (or error string)

print(result.meta.fastest_model)             # "claude-haiku-4-5"
print(result.meta.cheapest_model)            # "gpt-4o-mini"
print(result.meta.total_cost_usd)            # 0.000087
```

---

### `pd.models() → List[ModelInfo]`

List all available models with pricing.

```python
for m in pd.models():
    print(f"{m.id} ({m.provider}): ${m.input_per_1m}/1M in, ${m.output_per_1m}/1M out")
```

---

### `pd.usage() → dict`

Retrieve usage stats for the current billing period.

```python
usage = pd.usage()
print(usage["eval_count"])            # 42
print(usage["free_evals_remaining"])  # 58
```

---

### `pd.evals(limit?, offset?) → List[dict]`

List past evaluation runs.

```python
evals = pd.evals(limit=10)
for e in evals:
    print(e["eval_id"], e["created_at"])
```

---

### `pd.eval(eval_id) → dict`

Fetch full details for a single evaluation.

```python
detail = pd.eval("eval_abc123")
```

---

## Exceptions

| Exception | HTTP status | When |
|-----------|-------------|------|
| `AuthenticationError` | 401 | Invalid or missing API key |
| `QuotaExceededError` | 402 / 429 | Free quota or rate limit hit |
| `ValidationError` | 422 | Bad request payload |
| `APIError` | 5xx / other | Server errors, network failures |

All exceptions inherit from `PromptDiffError` and expose a `status_code` attribute.

```python
from promptdiff import PromptDiff, AuthenticationError, QuotaExceededError

try:
    result = pd.compare(...)
except AuthenticationError:
    print("Check your API key")
except QuotaExceededError:
    print("Upgrade your plan or wait for the rate limit to reset")
```

## Links

- Docs: https://promptdiff.bizmarq.com/docs
- Dashboard: https://promptdiff.bizmarq.com
