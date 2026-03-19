"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCost, formatLatency, providerColor, copyToClipboard } from "@/lib/utils";
import type { ModelResult } from "@/lib/api";
import { Star, Copy, Check, Zap, DollarSign, Hash, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ModelResultCardProps {
  result: ModelResult;
  isFastest: boolean;
  isCheapest: boolean;
}

export function ModelResultCard({ result, isFastest, isCheapest }: ModelResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(result.output);
    setCopied(true);
    toast.success("Output copied");
    setTimeout(() => setCopied(false), 2000);
  };

  if (result.error) {
    return (
      <div className="bg-white rounded-xl border border-destructive/30 p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm font-mono">{result.model}</span>
          <Badge className={cn("text-xs capitalize", providerColor(result.provider))}>
            {result.provider}
          </Badge>
        </div>
        <div className="flex items-start gap-2 text-destructive bg-destructive/5 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border hover:border-primary/30 transition-colors flex flex-col gap-0 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border/50 flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm font-mono text-foreground">
              {result.model}
            </span>
            {isFastest && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                Fastest
              </span>
            )}
            {isCheapest && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <Star className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                Cheapest
              </span>
            )}
          </div>
          <Badge className={cn("text-xs capitalize w-fit", providerColor(result.provider))}>
            {result.provider}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>

      {/* Output */}
      <div className="px-5 py-4 flex-1">
        <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
          {result.output}
        </p>
      </div>

      {/* Metrics */}
      <div className="px-5 py-4 border-t border-border/50 bg-muted/20">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Latency</span>
            </div>
            <span
              className={cn(
                "text-sm font-semibold tabular-nums",
                isFastest ? "text-amber-600" : "text-foreground"
              )}
            >
              {formatLatency(result.latency_ms)}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Cost</span>
            </div>
            <span
              className={cn(
                "text-sm font-semibold tabular-nums",
                isCheapest ? "text-emerald-600" : "text-foreground"
              )}
            >
              {formatCost(result.cost_usd)}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1 mb-1">
              <Hash className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Tokens</span>
            </div>
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {result.total_tokens.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Token breakdown */}
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-center gap-4">
          <span className="text-xs text-muted-foreground">
            <span className="font-mono">{result.input_tokens}</span> in
          </span>
          <span className="text-muted-foreground/40 text-xs">+</span>
          <span className="text-xs text-muted-foreground">
            <span className="font-mono">{result.output_tokens}</span> out
          </span>
        </div>
      </div>
    </div>
  );
}

export function ModelResultSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
