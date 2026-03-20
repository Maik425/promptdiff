import { createErrorFromStatus, PromptDiffError } from './errors.js';
import type {
  CompareOptions,
  CompareResponse,
  EvalRecord,
  EvalsOptions,
  EvalsResponse,
  ModelInfo,
  PromptDiffConfig,
  RawCompareResponse,
  RawEvalMeta,
  RawEvalRecord,
  RawEvalResult,
  RawEvalsResponse,
  RawModelInfo,
  RawUsageResponse,
  TokenUsage,
  UsageResponse,
  EvalMeta,
  EvalResult,
} from './types.js';

const SDK_VERSION = '0.1.0';
const DEFAULT_BASE_URL = 'https://promptdiff.bizmarq.com/api';

// ---------------------------------------------------------------------------
// snake_case → camelCase converters (typed, not generic object walk)
// ---------------------------------------------------------------------------

function convertTokenUsage(raw: { input: number; output: number; total: number }): TokenUsage {
  return { input: raw.input, output: raw.output, total: raw.total };
}

function convertEvalResult(raw: RawEvalResult): EvalResult {
  const result: EvalResult = {
    model: raw.model,
    provider: raw.provider,
    output: raw.output,
    latencyMs: raw.latency_ms,
    tokens: convertTokenUsage(raw.tokens),
    costUsd: raw.cost_usd,
  };
  if (raw.error !== undefined) {
    result.error = raw.error;
  }
  return result;
}

function convertEvalMeta(raw: RawEvalMeta): EvalMeta {
  return {
    totalCostUsd: raw.total_cost_usd,
    fastestModel: raw.fastest_model,
    cheapestModel: raw.cheapest_model,
  };
}

function convertCompareResponse(raw: RawCompareResponse): CompareResponse {
  return {
    evalId: raw.eval_id,
    results: raw.results.map(convertEvalResult),
    meta: convertEvalMeta(raw.meta),
  };
}

function convertModelInfo(raw: RawModelInfo): ModelInfo {
  return {
    id: raw.id,
    name: raw.name,
    provider: raw.provider,
    inputPer1m: raw.input_per_1m,
    outputPer1m: raw.output_per_1m,
  };
}

function convertUsageResponse(raw: RawUsageResponse): UsageResponse {
  return {
    totalRequests: raw.total_requests,
    totalCostUsd: raw.total_cost_usd,
    period: {
      startDate: raw.period.start_date,
      endDate: raw.period.end_date,
    },
  };
}

function convertEvalRecord(raw: RawEvalRecord): EvalRecord {
  const record: EvalRecord = {
    id: raw.id,
    prompt: raw.prompt,
    models: raw.models,
    results: raw.results.map(convertEvalResult),
    meta: convertEvalMeta(raw.meta),
    createdAt: raw.created_at,
  };
  if (raw.input !== undefined) {
    record.input = raw.input;
  }
  return record;
}

function convertEvalsResponse(raw: RawEvalsResponse): EvalsResponse {
  return {
    evals: raw.evals.map(convertEvalRecord),
    total: raw.total,
  };
}

// ---------------------------------------------------------------------------
// CompareOptions → API request body (camelCase → snake_case)
// ---------------------------------------------------------------------------

interface RawCompareBody {
  prompt: string;
  models: string[];
  input?: string;
  temperature?: number;
  max_tokens?: number;
}

function buildCompareBody(opts: CompareOptions): RawCompareBody {
  const body: RawCompareBody = {
    prompt: opts.prompt,
    models: opts.models,
  };
  if (opts.input !== undefined) body.input = opts.input;
  if (opts.temperature !== undefined) body.temperature = opts.temperature;
  if (opts.maxTokens !== undefined) body.max_tokens = opts.maxTokens;
  return body;
}

// ---------------------------------------------------------------------------
// PromptDiff client
// ---------------------------------------------------------------------------

export class PromptDiff {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: PromptDiffConfig) {
    if (!config.apiKey || config.apiKey.trim() === '') {
      throw new Error('PromptDiff: apiKey is required');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
  }

  // -------------------------------------------------------------------------
  // HTTP layer
  // -------------------------------------------------------------------------

  private buildHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'User-Agent': `promptdiff-js/${SDK_VERSION}`,
    };
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const init: RequestInit = {
      method,
      headers: this.buildHeaders(),
    };

    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (cause) {
      throw new PromptDiffError(
        `Network error: ${cause instanceof Error ? cause.message : String(cause)}`,
      );
    }

    if (!response.ok) {
      let message = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errBody = (await response.json()) as { error?: string; message?: string };
        if (errBody.error) message = errBody.error;
        else if (errBody.message) message = errBody.message;
      } catch {
        // ignore JSON parse errors on error bodies
      }
      throw createErrorFromStatus(response.status, message);
    }

    return response.json() as Promise<T>;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Compare LLM outputs across one or more models for the given prompt.
   *
   * @example
   * const result = await pd.compare({
   *   prompt: 'Summarize in 2 sentences',
   *   models: ['claude-haiku-4-5', 'gpt-4o'],
   * });
   */
  async compare(opts: CompareOptions): Promise<CompareResponse> {
    if (!opts.prompt || opts.prompt.trim() === '') {
      throw new Error('compare: prompt is required');
    }
    if (!Array.isArray(opts.models) || opts.models.length === 0) {
      throw new Error('compare: at least one model is required');
    }

    const raw = await this.request<RawCompareResponse>(
      'POST',
      '/compare',
      buildCompareBody(opts),
    );
    return convertCompareResponse(raw);
  }

  /**
   * List all models available for comparison with their pricing info.
   */
  async models(): Promise<ModelInfo[]> {
    const raw = await this.request<RawModelInfo[]>('GET', '/models');
    return raw.map(convertModelInfo);
  }

  /**
   * Retrieve usage statistics for the current billing period.
   */
  async usage(): Promise<UsageResponse> {
    const raw = await this.request<RawUsageResponse>('GET', '/usage');
    return convertUsageResponse(raw);
  }

  /**
   * List past evaluation runs, newest first.
   *
   * @param opts.limit  Max number of records to return (default: 20)
   * @param opts.offset Pagination offset (default: 0)
   */
  async evals(opts: EvalsOptions = {}): Promise<EvalsResponse> {
    const params = new URLSearchParams();
    if (opts.limit !== undefined) params.set('limit', String(opts.limit));
    if (opts.offset !== undefined) params.set('offset', String(opts.offset));
    const qs = params.toString() ? `?${params.toString()}` : '';

    const raw = await this.request<RawEvalsResponse>('GET', `/evals${qs}`);
    return convertEvalsResponse(raw);
  }

  /**
   * Retrieve a single evaluation run by its ID.
   *
   * @param evalId The evaluation ID returned from `compare` or `evals`
   */
  async eval(evalId: string): Promise<EvalRecord> {
    if (!evalId || evalId.trim() === '') {
      throw new Error('eval: evalId is required');
    }
    const raw = await this.request<RawEvalRecord>('GET', `/evals/${encodeURIComponent(evalId)}`);
    return convertEvalRecord(raw);
  }
}
