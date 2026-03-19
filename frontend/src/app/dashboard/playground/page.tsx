"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ModelResultCard,
  ModelResultSkeleton,
} from "@/components/playground/ModelResultCard";
import {
  getModels,
  compare,
  type Model,
  type CompareResponse,
  type ModelResult,
} from "@/lib/api";
import {
  formatCost,
  estimateCost,
  estimateTokens,
  copyToClipboard,
  providerColor,
  cn,
} from "@/lib/utils";
import {
  Play,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Settings2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// Group models by provider
function groupByProvider(models: Model[]): Record<string, Model[]> {
  return models.reduce(
    (acc, m) => {
      const p = m.provider;
      if (!acc[p]) acc[p] = [];
      acc[p].push(m);
      return acc;
    },
    {} as Record<string, Model[]>
  );
}

function buildCurlCommand(
  prompt: string,
  input: string,
  models: string[],
  temperature: number,
  maxTokens: number
): string {
  const body: Record<string, unknown> = {
    prompt,
    models,
    options: { temperature, max_tokens: maxTokens },
  };
  if (input) body.input = input;

  return `curl -X POST https://promptdiff.bizmarq.com/api/v1/compare \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer pd_your_api_key" \\
  -d '${JSON.stringify(body, null, 2)}'`;
}

export default function PlaygroundPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [prompt, setPrompt] = useState("");
  const [input, setInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(500);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<CompareResponse | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  useEffect(() => {
    getModels()
      .then((data) => {
        setModels(data.models);
        // Pre-select first 3 models
        const defaultSelected = new Set(
          data.models.slice(0, 3).map((m) => m.id)
        );
        setSelectedModels(defaultSelected);
      })
      .catch(() => toast.error("Failed to load models"))
      .finally(() => setModelsLoading(false));
  }, []);

  const toggleModel = useCallback((id: string) => {
    setSelectedModels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const estimatedCostValue = estimateCost(
    models.filter((m) => selectedModels.has(m.id)),
    estimateTokens(prompt + input),
    maxTokens
  );

  const handleCompare = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    if (selectedModels.size === 0) {
      toast.error("Select at least one model");
      return;
    }

    setRunning(true);
    setResults(null);

    try {
      const data = await compare({
        prompt: prompt.trim(),
        input: input.trim() || undefined,
        models: Array.from(selectedModels),
        options: { temperature, max_tokens: maxTokens },
      });
      setResults(data);
      toast.success(`Comparison complete — ${data.results.length} models`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Comparison failed");
    } finally {
      setRunning(false);
    }
  };

  const handleCopyJson = async () => {
    if (!results) return;
    await copyToClipboard(JSON.stringify(results, null, 2));
    setCopiedJson(true);
    toast.success("JSON copied");
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyCurl = async () => {
    const cmd = buildCurlCommand(
      prompt,
      input,
      Array.from(selectedModels),
      temperature,
      maxTokens
    );
    await copyToClipboard(cmd);
    setCopiedCurl(true);
    toast.success("curl command copied");
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const grouped = groupByProvider(models);

  const fastestModel = results?.results.reduce((a: ModelResult, b: ModelResult) =>
    a.latency_ms < b.latency_ms ? a : b
  )?.model;
  const cheapestModel = results?.results.reduce((a: ModelResult, b: ModelResult) =>
    a.cost_usd < b.cost_usd ? a : b
  )?.model;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* LEFT PANEL: Config */}
      <div className="lg:w-80 xl:w-96 shrink-0 border-r border-border bg-white flex flex-col">
        <div className="px-5 py-4 border-b border-border">
          <h1 className="text-base font-semibold text-foreground">
            Playground
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Compare LLM outputs side by side
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Prompt */}
          <div className="p-5 space-y-3 border-b border-border">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                Prompt
              </label>
              <Textarea
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[140px] resize-none text-sm font-mono focus-visible:ring-primary/50"
              />
              <p className="text-xs text-muted-foreground mt-1.5 text-right">
                ~{estimateTokens(prompt)} tokens
              </p>
            </div>

            {/* Optional input */}
            <div>
              <button
                onClick={() => setShowInput(!showInput)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showInput ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                Optional input variable
              </button>
              {showInput && (
                <Textarea
                  placeholder="Input / context to inject..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="mt-2 min-h-[80px] resize-none text-sm font-mono"
                />
              )}
            </div>
          </div>

          {/* Model selection */}
          <div className="p-5 border-b border-border">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
              Models ({selectedModels.size} selected)
            </label>

            {modelsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 bg-muted/50 rounded-md animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(grouped).map(([provider, providerModels]) => (
                  <div key={provider}>
                    <p className="text-xs font-medium text-muted-foreground mb-2 capitalize flex items-center gap-1.5">
                      <span
                        className={cn(
                          "inline-block w-2 h-2 rounded-full",
                          provider === "openai"
                            ? "bg-emerald-500"
                            : provider === "anthropic"
                              ? "bg-amber-500"
                              : provider === "google"
                                ? "bg-blue-500"
                                : "bg-purple-500"
                        )}
                      />
                      {provider}
                    </p>
                    <div className="space-y-1.5">
                      {providerModels.map((m) => (
                        <label
                          key={m.id}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                            selectedModels.has(m.id)
                              ? "bg-primary/8 border border-primary/20"
                              : "hover:bg-muted/50 border border-transparent"
                          )}
                        >
                          <Checkbox
                            id={m.id}
                            checked={selectedModels.has(m.id)}
                            onCheckedChange={() => toggleModel(m.id)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {m.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              ${m.input_per_1m}/1M in
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Advanced options */}
          <div className="p-5">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <Settings2 className="w-3.5 h-3.5" />
              Advanced options
              {showAdvanced ? (
                <ChevronUp className="w-3.5 h-3.5 ml-auto" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-auto" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-foreground">
                      Temperature
                    </label>
                    <span className="text-xs font-mono text-muted-foreground">
                      {temperature.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={2}
                    step={0.1}
                    value={[temperature]}
                    onValueChange={(vals) => {
                      const arr = Array.isArray(vals) ? vals : [vals as number];
                      setTemperature(arr[0] ?? temperature);
                    }}
                    className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">0 (precise)</span>
                    <span className="text-xs text-muted-foreground">2 (creative)</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-foreground">
                      Max tokens
                    </label>
                    <span className="text-xs font-mono text-muted-foreground">
                      {maxTokens}
                    </span>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={4096}
                    value={maxTokens}
                    onChange={(e) =>
                      setMaxTokens(Math.max(1, parseInt(e.target.value) || 500))
                    }
                    className="h-8 text-sm font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with cost + run button */}
        <div className="p-5 border-t border-border bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Est. cost</span>
            </div>
            <span className="text-sm font-mono font-semibold text-foreground">
              {formatCost(estimatedCostValue)}
            </span>
          </div>
          <Button
            onClick={handleCompare}
            disabled={running || selectedModels.size === 0 || !prompt.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-white gap-2 h-10"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running comparison...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Compare ({selectedModels.size} models)
              </>
            )}
          </Button>
        </div>
      </div>

      {/* RIGHT PANEL: Results */}
      <div className="flex-1 flex flex-col bg-background min-h-screen">
        {/* Results toolbar */}
        {results && (
          <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-mono">
                eval_id: {results.eval_id}
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-xs text-muted-foreground">
                Total:{" "}
                <strong className="text-foreground font-mono">
                  {formatCost(results.meta.total_cost_usd)}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCurl}
                className="gap-1.5 h-7 text-xs"
              >
                {copiedCurl ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                curl
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyJson}
                className="gap-1.5 h-7 text-xs"
              >
                {copiedJson ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                JSON
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 p-6">
          {/* Empty state */}
          {!running && !results && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Play className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Ready to compare
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                Enter a prompt, select your models, then hit{" "}
                <strong>Compare</strong> to see results side by side.
              </p>
            </div>
          )}

          {/* Loading skeletons */}
          {running && (
            <div>
              <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Running {selectedModels.size} models in parallel...
              </p>
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(selectedModels.size, 3)}, minmax(0, 1fr))`,
                }}
              >
                {Array.from(selectedModels).map((id) => (
                  <ModelResultSkeleton key={id} />
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {results && !running && (
            <div className="space-y-6">
              {/* Meta summary */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="gap-1.5 text-xs">
                  <span className="text-muted-foreground">Fastest:</span>
                  <span className="font-mono text-foreground">
                    {results.meta.fastest_model}
                  </span>
                </Badge>
                <Badge variant="outline" className="gap-1.5 text-xs">
                  <span className="text-muted-foreground">Cheapest:</span>
                  <span className="font-mono text-foreground">
                    {results.meta.cheapest_model}
                  </span>
                </Badge>
                <Badge variant="outline" className="gap-1.5 text-xs">
                  <span className="text-muted-foreground">Total cost:</span>
                  <span className="font-mono text-foreground">
                    {formatCost(results.meta.total_cost_usd)}
                  </span>
                </Badge>
              </div>

              {/* Result cards */}
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(results.results.length, 3)}, minmax(0, 1fr))`,
                }}
              >
                {results.results.map((r) => (
                  <ModelResultCard
                    key={r.model}
                    result={r}
                    isFastest={r.model === fastestModel}
                    isCheapest={r.model === cheapestModel}
                  />
                ))}
              </div>

              {/* View in history link */}
              <div className="flex items-center justify-center pt-2">
                <a
                  href={`/dashboard/evals/${results.eval_id}`}
                  className="text-xs text-muted-foreground hover:text-primary underline underline-offset-2 transition-colors"
                >
                  View full eval detail ({results.eval_id})
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
