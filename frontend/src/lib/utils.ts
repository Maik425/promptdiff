import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCost(usd: number): string {
  if (usd === 0) return "$0.00";
  if (usd < 0.00001) return `$${usd.toFixed(8)}`;
  if (usd < 0.001) return `$${usd.toFixed(6)}`;
  if (usd < 0.01) return `$${usd.toFixed(5)}`;
  return `$${usd.toFixed(4)}`;
}

export function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + "…";
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function estimateCost(
  models: Array<{ input_per_1m: number; output_per_1m: number }>,
  promptTokens: number,
  maxTokens: number
): number {
  return models.reduce((total, m) => {
    const inputCost = (promptTokens / 1_000_000) * m.input_per_1m;
    const outputCost = (maxTokens / 1_000_000) * m.output_per_1m;
    return total + inputCost + outputCost;
  }, 0);
}

export function estimateTokens(text: string): number {
  // Rough approximation: ~4 chars per token
  return Math.ceil(text.length / 4);
}

export function providerColor(provider: string): string {
  const colors: Record<string, string> = {
    openai: "bg-emerald-100 text-emerald-800",
    anthropic: "bg-amber-100 text-amber-800",
    google: "bg-blue-100 text-blue-800",
    meta: "bg-purple-100 text-purple-800",
    mistral: "bg-orange-100 text-orange-800",
    cohere: "bg-teal-100 text-teal-800",
  };
  return colors[provider?.toLowerCase()] ?? "bg-gray-100 text-gray-800";
}
