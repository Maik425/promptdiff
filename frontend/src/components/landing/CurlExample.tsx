"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const CURL_EXAMPLE = `curl -X POST https://promptdiff.bizmarq.com/api/v1/compare \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer pd_your_api_key" \\
  -d '{
    "prompt": "Explain async/await in JavaScript in one paragraph.",
    "models": ["gpt-4o-mini", "claude-3-haiku", "gemini-1.5-flash"],
    "options": {
      "temperature": 0.7,
      "max_tokens": 300
    }
  }'`;

const RESPONSE_EXAMPLE = `{
  "eval_id": "eval_01j8x4m3k9",
  "results": [
    {
      "model": "gpt-4o-mini",
      "provider": "openai",
      "output": "Async/await is syntactic sugar...",
      "latency_ms": 842,
      "cost_usd": 0.000018,
      "input_tokens": 22,
      "output_tokens": 67,
      "total_tokens": 89
    },
    {
      "model": "claude-3-haiku",
      "provider": "anthropic",
      "output": "JavaScript's async/await syntax...",
      "latency_ms": 1205,
      "cost_usd": 0.000032,
      "input_tokens": 22,
      "output_tokens": 71,
      "total_tokens": 93
    }
  ],
  "meta": {
    "total_cost_usd": 0.000050,
    "fastest_model": "gpt-4o-mini",
    "cheapest_model": "gpt-4o-mini",
    "created_at": "2025-03-20T10:23:01Z"
  }
}`;

export function CurlExample() {
  const [copiedRequest, setCopiedRequest] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [activeTab, setActiveTab] = useState<"request" | "response">("request");

  const handleCopy = async (text: string, type: "request" | "response") => {
    await copyToClipboard(text);
    if (type === "request") {
      setCopiedRequest(true);
      setTimeout(() => setCopiedRequest(false), 2000);
    } else {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const content = activeTab === "request" ? CURL_EXAMPLE : RESPONSE_EXAMPLE;
  const copied = activeTab === "request" ? copiedRequest : copiedResponse;

  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Simple API, powerful results
          </h2>
          <p className="text-muted-foreground">
            Integrate in minutes. Works with any HTTP client.
          </p>
        </div>

        <div className="rounded-2xl border border-border overflow-hidden shadow-lg bg-[#1a1a2e]">
          {/* Tab bar */}
          <div className="flex items-center border-b border-white/8 px-4">
            <button
              onClick={() => setActiveTab("request")}
              className={`px-4 py-3 text-sm font-mono transition-colors ${
                activeTab === "request"
                  ? "text-white border-b-2 border-primary"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              request.sh
            </button>
            <button
              onClick={() => setActiveTab("response")}
              className={`px-4 py-3 text-sm font-mono transition-colors ${
                activeTab === "response"
                  ? "text-white border-b-2 border-primary"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              response.json
            </button>
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(content, activeTab)}
                className="text-white/50 hover:text-white hover:bg-white/10 gap-1.5 h-8"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span className="text-xs">{copied ? "Copied!" : "Copy"}</span>
              </Button>
            </div>
          </div>

          {/* Code block */}
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono text-white/85 leading-relaxed whitespace-pre">
              <code>{content}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
