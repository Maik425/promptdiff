// ---------------------------------------------------------------------------
// Public types — camelCase in TypeScript, converted from snake_case at runtime
// ---------------------------------------------------------------------------

export interface PromptDiffConfig {
  apiKey: string;
  /** Override the default base URL. Defaults to https://promptdiff.bizmarq.com/api */
  baseUrl?: string;
}

// ---- Compare ---------------------------------------------------------------

export interface CompareOptions {
  prompt: string;
  /** Optional context / document passed alongside the prompt */
  input?: string;
  models: string[];
  temperature?: number;
  maxTokens?: number;
}

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

export interface EvalResult {
  model: string;
  provider: string;
  output: string;
  latencyMs: number;
  tokens: TokenUsage;
  costUsd: number;
  /** Present only when the model call failed */
  error?: string;
}

export interface EvalMeta {
  totalCostUsd: number;
  fastestModel: string;
  cheapestModel: string;
}

export interface CompareResponse {
  evalId: string;
  results: EvalResult[];
  meta: EvalMeta;
}

// ---- Models ----------------------------------------------------------------

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  /** Cost in USD per 1 million input tokens */
  inputPer1m: number;
  /** Cost in USD per 1 million output tokens */
  outputPer1m: number;
}

// ---- Usage -----------------------------------------------------------------

export interface UsagePeriod {
  startDate: string;
  endDate: string;
}

export interface UsageResponse {
  totalRequests: number;
  totalCostUsd: number;
  period: UsagePeriod;
}

// ---- Evals -----------------------------------------------------------------

export interface EvalsOptions {
  limit?: number;
  offset?: number;
}

export interface EvalRecord {
  id: string;
  prompt: string;
  input?: string;
  models: string[];
  results: EvalResult[];
  meta: EvalMeta;
  createdAt: string;
}

export interface EvalsResponse {
  evals: EvalRecord[];
  total: number;
}

// ---------------------------------------------------------------------------
// Raw API shapes (snake_case) — used internally for deserialization only
// ---------------------------------------------------------------------------

/** @internal */
export interface RawTokenUsage {
  input: number;
  output: number;
  total: number;
}

/** @internal */
export interface RawEvalResult {
  model: string;
  provider: string;
  output: string;
  latency_ms: number;
  tokens: RawTokenUsage;
  cost_usd: number;
  error?: string;
}

/** @internal */
export interface RawEvalMeta {
  total_cost_usd: number;
  fastest_model: string;
  cheapest_model: string;
}

/** @internal */
export interface RawCompareResponse {
  eval_id: string;
  results: RawEvalResult[];
  meta: RawEvalMeta;
}

/** @internal */
export interface RawModelInfo {
  id: string;
  name: string;
  provider: string;
  input_per_1m: number;
  output_per_1m: number;
}

/** @internal */
export interface RawUsagePeriod {
  start_date: string;
  end_date: string;
}

/** @internal */
export interface RawUsageResponse {
  total_requests: number;
  total_cost_usd: number;
  period: RawUsagePeriod;
}

/** @internal */
export interface RawEvalRecord {
  id: string;
  prompt: string;
  input?: string;
  models: string[];
  results: RawEvalResult[];
  meta: RawEvalMeta;
  created_at: string;
}

/** @internal */
export interface RawEvalsResponse {
  evals: RawEvalRecord[];
  total: number;
}
