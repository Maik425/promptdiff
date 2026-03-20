/**
 * PromptDiff TypeScript SDK — basic usage examples
 *
 * Run with ts-node or tsx:
 *   npx tsx examples/basic.ts
 *
 * Or after building:
 *   node dist/examples/basic.js
 */

import {
  PromptDiff,
  AuthenticationError,
  QuotaExceededError,
  ValidationError,
  APIError,
  PromptDiffError,
} from '../src/index.js';

const API_KEY = process.env['PROMPTDIFF_API_KEY'] ?? 'pd_your_key_here';

const pd = new PromptDiff({ apiKey: API_KEY });

// ---------------------------------------------------------------------------
// 1. Compare models
// ---------------------------------------------------------------------------
async function runCompare(): Promise<void> {
  console.log('--- Compare ---');

  const result = await pd.compare({
    prompt: 'Summarize this article in 2 sentences',
    input: 'Artificial intelligence is transforming every industry...',
    models: ['claude-haiku-4-5', 'gpt-4o', 'gemini-2.0-flash'],
    temperature: 0.7,
    maxTokens: 500,
  });

  console.log(`Eval ID: ${result.evalId}`);

  for (const r of result.results) {
    if (r.error) {
      console.log(`${r.model}: ERROR — ${r.error}`);
    } else {
      console.log(`${r.model}: ${r.output}`);
      console.log(`  Latency : ${r.latencyMs}ms`);
      console.log(`  Tokens  : ${r.tokens.input} in / ${r.tokens.output} out`);
      console.log(`  Cost    : $${r.costUsd.toFixed(6)}`);
    }
  }

  console.log(`\nFastest : ${result.meta.fastestModel}`);
  console.log(`Cheapest: ${result.meta.cheapestModel}`);
  console.log(`Total   : $${result.meta.totalCostUsd.toFixed(6)}`);
}

// ---------------------------------------------------------------------------
// 2. List available models
// ---------------------------------------------------------------------------
async function listModels(): Promise<void> {
  console.log('\n--- Models ---');

  const models = await pd.models();

  for (const m of models) {
    console.log(`${m.id} (${m.provider})`);
    console.log(`  Input : $${m.inputPer1m}/1M tokens`);
    console.log(`  Output: $${m.outputPer1m}/1M tokens`);
  }
}

// ---------------------------------------------------------------------------
// 3. Usage statistics
// ---------------------------------------------------------------------------
async function showUsage(): Promise<void> {
  console.log('\n--- Usage ---');

  const usage = await pd.usage();

  console.log(`Requests: ${usage.totalRequests}`);
  console.log(`Cost    : $${usage.totalCostUsd.toFixed(4)}`);
  console.log(`Period  : ${usage.period.startDate} → ${usage.period.endDate}`);
}

// ---------------------------------------------------------------------------
// 4. List and retrieve evals
// ---------------------------------------------------------------------------
async function showEvals(): Promise<void> {
  console.log('\n--- Evals ---');

  const { evals, total } = await pd.evals({ limit: 5 });

  console.log(`Showing ${evals.length} of ${total} evals`);

  if (evals.length > 0) {
    // Safe access — evals[0] can be undefined when noUncheckedIndexedAccess is on
    const first = evals[0];
    if (first !== undefined) {
      console.log(`\nLatest eval: ${first.id}`);
      console.log(`Prompt     : ${first.prompt}`);
      console.log(`Models     : ${first.models.join(', ')}`);
      console.log(`Created at : ${first.createdAt}`);

      // Fetch the same eval by ID
      const fetched = await pd.eval(first.id);
      console.log(`Re-fetched : ${fetched.id} (${fetched.results.length} results)`);
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Error handling
// ---------------------------------------------------------------------------
async function errorHandlingDemo(): Promise<void> {
  console.log('\n--- Error handling ---');

  const badClient = new PromptDiff({ apiKey: 'pd_invalid' });

  try {
    await badClient.models();
  } catch (err) {
    if (err instanceof AuthenticationError) {
      console.log(`AuthenticationError (${err.statusCode}): ${err.message}`);
    } else if (err instanceof QuotaExceededError) {
      console.log(`QuotaExceededError (${err.statusCode}): ${err.message}`);
    } else if (err instanceof ValidationError) {
      console.log(`ValidationError (${err.statusCode}): ${err.message}`);
    } else if (err instanceof APIError) {
      console.log(`APIError (${err.statusCode}): ${err.message}`);
    } else if (err instanceof PromptDiffError) {
      console.log(`PromptDiffError: ${err.message}`);
    } else {
      throw err;
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  try {
    await runCompare();
    await listModels();
    await showUsage();
    await showEvals();
    await errorHandlingDemo();
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();
