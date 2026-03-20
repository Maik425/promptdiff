const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://promptdiff.bizmarq.com/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const apiKey =
    typeof window !== "undefined" ? localStorage.getItem("pd_api_key") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    ...(options?.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(
      err.error || err.message || res.statusText,
      res.status
    );
  }

  return res.json() as Promise<T>;
}

// Auth
export interface SignupResponse {
  user_id: string;
  api_key: string;
}

export interface LoginResponse {
  token: string;
  api_key: string;
}

export async function signup(
  email: string,
  password: string
): Promise<SignupResponse> {
  return apiFetch<SignupResponse>("/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// Models
export interface Model {
  id: string;
  name: string;
  provider: string;
  input_per_1m: number;
  output_per_1m: number;
}

export interface ModelsResponse {
  models: Model[];
}

export async function getModels(): Promise<ModelsResponse> {
  return apiFetch<ModelsResponse>("/v1/models");
}

// Compare
export interface CompareOptions {
  temperature?: number;
  max_tokens?: number;
}

export interface CompareRequest {
  prompt: string;
  input?: string;
  models: string[];
  options?: CompareOptions;
}

export interface ModelResult {
  model: string;
  provider: string;
  output: string;
  latency_ms: number;
  cost_usd: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  error?: string;
}

export interface CompareResponse {
  eval_id: string;
  results: ModelResult[];
  meta: {
    total_cost_usd: number;
    fastest_model: string;
    cheapest_model: string;
    created_at: string;
  };
}

export async function compare(req: CompareRequest): Promise<CompareResponse> {
  return apiFetch<CompareResponse>("/v1/compare", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// Evals
export interface EvalSummary {
  eval_id: string;
  prompt: string;
  models: string[];
  total_cost_usd: number;
  created_at: string;
  model_count: number;
}

export interface EvalsResponse {
  evals: EvalSummary[];
  limit: number;
  offset: number;
  total?: number;
}

export async function getEvals(
  limit = 20,
  offset = 0
): Promise<EvalsResponse> {
  return apiFetch<EvalsResponse>(`/v1/evals?limit=${limit}&offset=${offset}`);
}

export async function getEval(id: string): Promise<CompareResponse & { prompt: string; input?: string }> {
  return apiFetch(`/v1/evals/${id}`);
}

// Usage
export interface UsageResponse {
  eval_count: number;
  free_evals_remaining: number;
  current_tier: string;
  current_rate_usd: number;
  has_payment_method?: boolean;
  email?: string;
  created_at?: string;
  monthly_spend_limit_usd?: number;
  pricing: {
    free_tier_limit: number;
    paid_rate_per_eval: number;
    volume_discounts?: Array<{ threshold: number; rate: number }>;
  };
}

export async function getUsage(): Promise<UsageResponse> {
  return apiFetch<UsageResponse>("/v1/usage");
}

// Auth helpers
export function getStoredApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pd_api_key");
}

export function storeApiKey(key: string): void {
  localStorage.setItem("pd_api_key", key);
}

export function clearAuth(): void {
  localStorage.removeItem("pd_api_key");
  localStorage.removeItem("pd_email");
}

export function isAuthenticated(): boolean {
  return !!getStoredApiKey();
}
