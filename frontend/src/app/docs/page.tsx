import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Documentation — PromptDiff",
};

export default function DocsPage() {
  return (
    <article className="prose prose-sm max-w-none">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
          Getting Started
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
          PromptDiff Overview
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          PromptDiff is an API that lets you compare LLM outputs across multiple
          models in a single request. Send a prompt, choose your models, and get
          back structured data on output, latency, cost, and tokens per model.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 not-prose">
        {[
          {
            title: "Quickstart",
            desc: "Make your first comparison in under 5 minutes.",
            href: "/docs/quickstart",
          },
          {
            title: "API Reference",
            desc: "Full reference for all endpoints and parameters.",
            href: "/docs/api-reference",
          },
          {
            title: "Models & Pricing",
            desc: "All supported models with per-token pricing.",
            href: "/docs/models",
          },
          {
            title: "Examples",
            desc: "Real-world usage patterns and code snippets.",
            href: "/docs/examples",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center justify-between p-4 bg-white rounded-xl border border-border hover:border-primary/40 hover:shadow-sm transition-all"
          >
            <div>
              <p className="text-sm font-semibold text-foreground mb-0.5">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
        Base URL
      </h2>
      <CodeBlock
        code="https://promptdiff.bizmarq.com/api/v1"
        language="text"
        filename="Base URL"
      />

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
        Authentication
      </h2>
      <p className="text-sm text-muted-foreground mb-3">
        All API requests (except auth endpoints) require a Bearer token in the
        Authorization header.
      </p>
      <CodeBlock
        code={`Authorization: Bearer pd_your_api_key`}
        language="http"
      />

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
        Quick example
      </h2>
      <CodeBlock
        language="bash"
        filename="compare.sh"
        code={`curl -X POST https://promptdiff.bizmarq.com/api/v1/compare \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer pd_your_api_key" \\
  -d '{
    "prompt": "Explain recursion in one sentence.",
    "models": ["gpt-4o-mini", "claude-3-haiku"],
    "options": { "temperature": 0.7, "max_tokens": 150 }
  }'`}
      />

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
        Response structure
      </h2>
      <CodeBlock
        language="json"
        filename="response.json"
        code={`{
  "eval_id": "eval_01j8x4m3k9",
  "results": [
    {
      "model": "gpt-4o-mini",
      "provider": "openai",
      "output": "Recursion is when a function calls itself...",
      "latency_ms": 842,
      "cost_usd": 0.000018,
      "input_tokens": 15,
      "output_tokens": 22,
      "total_tokens": 37
    }
  ],
  "meta": {
    "total_cost_usd": 0.000050,
    "fastest_model": "gpt-4o-mini",
    "cheapest_model": "gpt-4o-mini",
    "created_at": "2025-03-20T10:23:01Z"
  }
}`}
      />

      <div className="mt-8 p-4 bg-accent rounded-xl border border-primary/10 not-prose">
        <p className="text-sm font-medium text-primary mb-1">
          Ready to start?
        </p>
        <p className="text-sm text-muted-foreground">
          Get your API key by{" "}
          <Link href="/signup" className="text-primary underline underline-offset-2">
            signing up for free
          </Link>
          . You get 100 evals per month at no cost.
        </p>
      </div>
    </article>
  );
}
