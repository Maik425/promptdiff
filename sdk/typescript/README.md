# promptdiff

TypeScript SDK for [PromptDiff](https://promptdiff.bizmarq.com) — compare LLM outputs across models with one API call.

Zero dependencies. Works in Node 18+, Deno, Bun, and browsers.

## Installation

```bash
npm install promptdiff
```

## Quick start

```typescript
import { PromptDiff } from 'promptdiff';

const pd = new PromptDiff({ apiKey: 'pd_your_key_here' });

const result = await pd.compare({
  prompt: 'Summarize this article in 2 sentences',
  input: 'Article text here...',
  models: ['claude-haiku-4-5', 'gpt-4o', 'gemini-2.0-flash'],
  temperature: 0.7,
  maxTokens: 500,
});

for (const r of result.results) {
  console.log(`${r.model}: ${r.output}`);
  console.log(`  Latency: ${r.latencyMs}ms, Cost: $${r.costUsd.toFixed(6)}`);
}

console.log(`Fastest : ${result.meta.fastestModel}`);
console.log(`Cheapest: ${result.meta.cheapestModel}`);
console.log(`Total   : $${result.meta.totalCostUsd.toFixed(6)}`);
```

## API

### `new PromptDiff(config)`

| Option    | Type     | Default                                  | Description     |
|-----------|----------|------------------------------------------|-----------------|
| `apiKey`  | `string` | —                                        | Your API key    |
| `baseUrl` | `string` | `https://promptdiff.bizmarq.com/api`     | Override for self-hosting |

### `pd.compare(opts)`

Compare LLM outputs across multiple models.

```typescript
const result = await pd.compare({
  prompt: string;       // required
  input?: string;       // optional context / document
  models: string[];     // at least one model ID required
  temperature?: number;
  maxTokens?: number;
});
// returns Promise<CompareResponse>
```

### `pd.models()`

List all supported models with pricing.

```typescript
const models = await pd.models();
// returns Promise<ModelInfo[]>
```

### `pd.usage()`

Get usage statistics for the current billing period.

```typescript
const usage = await pd.usage();
// returns Promise<UsageResponse>
```

### `pd.evals(opts?)`

List past evaluation runs, newest first.

```typescript
const { evals, total } = await pd.evals({ limit: 10, offset: 0 });
// returns Promise<EvalsResponse>
```

### `pd.eval(evalId)`

Retrieve a single evaluation by ID.

```typescript
const record = await pd.eval('eval_abc123');
// returns Promise<EvalRecord>
```

## Error handling

All errors extend `PromptDiffError` and carry an optional `statusCode`.

```typescript
import {
  PromptDiffError,
  AuthenticationError,  // 401
  QuotaExceededError,   // 402
  ValidationError,      // 400 | 422
  APIError,             // all other non-2xx
} from 'promptdiff';

try {
  await pd.compare({ prompt: '...', models: ['gpt-4o'] });
} catch (err) {
  if (err instanceof AuthenticationError) {
    console.error('Check your API key');
  } else if (err instanceof QuotaExceededError) {
    console.error('Upgrade your plan');
  } else if (err instanceof ValidationError) {
    console.error('Bad request:', err.message);
  } else if (err instanceof PromptDiffError) {
    console.error(`API error ${err.statusCode}: ${err.message}`);
  }
}
```

## Building from source

```bash
npm install
npm run build   # outputs to dist/
```

## License

MIT
