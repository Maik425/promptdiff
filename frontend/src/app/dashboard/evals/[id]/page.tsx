"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ModelResultCard } from "@/components/playground/ModelResultCard";
import { getEval, type CompareResponse, type ModelResult } from "@/lib/api";
import { formatCost, formatDate, copyToClipboard } from "@/lib/utils";
import { ArrowLeft, Copy, Check, Clock } from "lucide-react";
import { toast } from "sonner";

export default function EvalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<
    (CompareResponse & { prompt: string; input?: string }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [copiedJson, setCopiedJson] = useState(false);

  useEffect(() => {
    if (!id) return;
    getEval(id)
      .then(setData)
      .catch(() => toast.error("Failed to load eval"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopyJson = async () => {
    if (!data) return;
    await copyToClipboard(JSON.stringify(data, null, 2));
    setCopiedJson(true);
    toast.success("JSON copied");
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const fastestModel = data?.results.reduce((a: ModelResult, b: ModelResult) =>
    a.latency_ms < b.latency_ms ? a : b
  )?.model;
  const cheapestModel = data?.results.reduce((a: ModelResult, b: ModelResult) =>
    a.cost_usd < b.cost_usd ? a : b
  )?.model;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard/evals"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Eval History
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Eval Detail
            </h1>
            {loading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <span className="font-mono text-sm text-muted-foreground">
                {id}
              </span>
            )}
          </div>
          {data?.meta.created_at && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(data.meta.created_at)}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyJson}
          disabled={!data}
          className="gap-1.5"
        >
          {copiedJson ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          Copy JSON
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Prompt and meta summary */}
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Prompt
                </p>
                <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-3 font-mono">
                  {data.prompt}
                </p>
              </div>
              {data.input && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Input
                  </p>
                  <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-3 font-mono">
                    {data.input}
                  </p>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* Meta stats */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="gap-1.5 text-xs">
                <span className="text-muted-foreground">Models:</span>
                <span className="font-mono">{data.results.length}</span>
              </Badge>
              <Badge variant="outline" className="gap-1.5 text-xs">
                <span className="text-muted-foreground">Total cost:</span>
                <span className="font-mono">
                  {formatCost(data.meta.total_cost_usd)}
                </span>
              </Badge>
              <Badge variant="outline" className="gap-1.5 text-xs">
                <span className="text-muted-foreground">Fastest:</span>
                <span className="font-mono">{data.meta.fastest_model}</span>
              </Badge>
              <Badge variant="outline" className="gap-1.5 text-xs">
                <span className="text-muted-foreground">Cheapest:</span>
                <span className="font-mono">{data.meta.cheapest_model}</span>
              </Badge>
            </div>
          </div>

          {/* Results grid */}
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${Math.min(data.results.length, 3)}, minmax(0, 1fr))`,
            }}
          >
            {data.results.map((r) => (
              <ModelResultCard
                key={r.model}
                result={r}
                isFastest={r.model === fastestModel}
                isCheapest={r.model === cheapestModel}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Eval not found.</p>
          <Link href="/dashboard/evals">
            <Button variant="outline" className="mt-4">
              Back to history
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
