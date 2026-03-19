"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCost, formatLatency, providerColor } from "@/lib/utils";
import { Play, Star, Zap, DollarSign } from "lucide-react";

// Pre-recorded demo result to show without auth
const DEMO_RESULT = {
  prompt: "Explain the difference between REST and GraphQL in 2 sentences.",
  results: [
    {
      model: "gpt-4o-mini",
      provider: "openai",
      output:
        "REST uses fixed endpoints where each URL represents a resource, requiring multiple requests for complex data. GraphQL uses a single flexible endpoint where clients specify exactly what data they need, reducing over-fetching and under-fetching.",
      latency_ms: 842,
      cost_usd: 0.000018,
      input_tokens: 22,
      output_tokens: 48,
      total_tokens: 70,
    },
    {
      model: "claude-3-haiku",
      provider: "anthropic",
      output:
        "REST is an architectural style using multiple fixed endpoints with predefined data structures, while GraphQL is a query language with a single endpoint allowing clients to request exactly the data they need. REST can lead to over-fetching or under-fetching data, whereas GraphQL gives clients precise control over the response shape.",
      latency_ms: 1205,
      cost_usd: 0.000032,
      input_tokens: 22,
      output_tokens: 63,
      total_tokens: 85,
    },
    {
      model: "gemini-1.5-flash",
      provider: "google",
      output:
        "REST (Representational State Transfer) uses multiple predefined endpoints, each returning a fixed data structure, often leading to over- or under-fetching. GraphQL uses a single endpoint where clients specify exactly the data they need in a query, offering more flexibility and efficiency.",
      latency_ms: 612,
      cost_usd: 0.000008,
      input_tokens: 22,
      output_tokens: 55,
      total_tokens: 77,
    },
  ],
};

function ResultCard({
  result,
  isFastest,
  isCheapest,
}: {
  result: (typeof DEMO_RESULT.results)[0];
  isFastest: boolean;
  isCheapest: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm font-mono text-foreground">
            {result.model}
          </span>
        </div>
        <Badge className={cn("text-xs capitalize", providerColor(result.provider))}>
          {result.provider}
        </Badge>
      </div>

      <p className="text-sm text-foreground/80 leading-relaxed flex-1 border-l-2 border-primary/20 pl-3">
        {result.output}
      </p>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Zap className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Latency</span>
            {isFastest && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
          </div>
          <span className="text-sm font-semibold tabular-nums">
            {formatLatency(result.latency_ms)}
          </span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <DollarSign className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Cost</span>
            {isCheapest && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
          </div>
          <span className="text-sm font-semibold tabular-nums">
            {formatCost(result.cost_usd)}
          </span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <span className="text-xs text-muted-foreground">Tokens</span>
          </div>
          <span className="text-sm font-semibold tabular-nums">
            {result.total_tokens}
          </span>
        </div>
      </div>
    </div>
  );
}

export function DemoSection() {
  const [showing, setShowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRunDemo = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowing(true);
    }, 1800);
  };

  const fastestModel = DEMO_RESULT.results.reduce((a, b) =>
    a.latency_ms < b.latency_ms ? a : b
  ).model;
  const cheapestModel = DEMO_RESULT.results.reduce((a, b) =>
    a.cost_usd < b.cost_usd ? a : b
  ).model;

  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Try it live
          </h2>
          <p className="text-muted-foreground">
            See PromptDiff in action. No sign-up required.
          </p>
        </div>

        {/* Demo prompt card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              demo — gpt-4o-mini, claude-3-haiku, gemini-1.5-flash
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Prompt
              </label>
              <div className="bg-muted/40 rounded-lg p-4 text-sm font-mono text-foreground">
                {DEMO_RESULT.prompt}
              </div>
            </div>

            {!showing && (
              <div className="flex justify-center pt-2">
                <Button
                  onClick={handleRunDemo}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-white gap-2 px-8"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Running comparison...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Demo Comparison
                    </>
                  )}
                </Button>
              </div>
            )}

            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3 p-5 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-20 w-full" />
                    <div className="grid grid-cols-3 gap-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showing && (
              <div className="pt-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {DEMO_RESULT.results.map((r) => (
                    <ResultCard
                      key={r.model}
                      result={r}
                      isFastest={r.model === fastestModel}
                      isCheapest={r.model === cheapestModel}
                    />
                  ))}
                </div>
                <p className="text-center text-xs text-muted-foreground pt-2">
                  Star = best in category.{" "}
                  <a href="/signup" className="text-primary underline underline-offset-2">
                    Sign up free
                  </a>{" "}
                  to run your own comparisons.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
