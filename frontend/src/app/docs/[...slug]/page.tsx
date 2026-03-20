import { CodeBlock } from "@/components/docs/CodeBlock";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

const QUICKSTART_PY = [
  "from promptdiff import PromptDiff",
  "",
  'pd = PromptDiff(api_key="pd_your_api_key")',
  "",
  "result = pd.compare(",
  '    prompt="Explain async/await in JavaScript.",',
  '    models=["gpt-4o-mini", "claude-haiku-4-5", "gemini-2.5-flash"],',
  ")",
  "",
  "for r in result.results:",
  "    print(r.model, r.latency_ms, r.cost_usd)",
  "    print(r.output[:100])",
  "    print()",
].join("\n");

const QUICKSTART_TS = [
  "import { PromptDiff } from 'promptdiff';",
  "",
  "const pd = new PromptDiff({ apiKey: 'pd_your_api_key' });",
  "",
  "const result = await pd.compare({",
  "  prompt: 'Explain async/await in JavaScript.',",
  "  models: ['gpt-4o-mini', 'claude-haiku-4-5', 'gemini-2.5-flash'],",
  "  temperature: 0.7,",
  "  maxTokens: 300,",
  "});",
  "",
  "for (const r of result.results) {",
  "  console.log(r.model, r.latencyMs, r.costUsd);",
  "  console.log(r.output.slice(0, 100));",
  "}",
].join("\n");

const EXAMPLES_PY = [
  "from promptdiff import PromptDiff",
  "",
  'pd = PromptDiff(api_key="pd_your_api_key")',
  "",
  "result = pd.compare(",
  '    prompt="Classify this text as spam or not: {input}",',
  '    models=["gpt-4o-mini", "claude-haiku-4-5", "gemini-2.5-flash", "grok-3-mini"],',
  '    input="Congratulations! You have won a prize."',
  ")",
  "",
  "# Sort by cost",
  "by_cost = sorted(result.results, key=lambda r: r.cost_usd)",
  "cheapest = by_cost[0]",
  'print("Cheapest:", cheapest.model, "cost:", cheapest.cost_usd)',
].join("\n");

const EXAMPLES_TS = [
  "const response = await fetch(",
  '  "https://promptdiff.bizmarq.com/api/v1/compare",',
  "  {",
  '    method: "POST",',
  "    headers: {",
  '      "Content-Type": "application/json",',
  "      Authorization: `Bearer ${process.env.PROMPTDIFF_API_KEY}`,",
  "    },",
  "    body: JSON.stringify({",
  '      prompt: "Explain closures in JavaScript briefly.",',
  '      models: ["gpt-4o-mini", "claude-haiku-4-5"],',
  "      options: { temperature: 0.5, max_tokens: 200 },",
  "    }),",
  "  }",
  ");",
  "",
  "const data = await response.json();",
  "console.log(`Fastest: ${data.meta.fastest_model}`);",
  "console.log(`Total cost: $${data.meta.total_cost_usd}`);",
].join("\n");

// Docs content definitions
const docsContent: Record<string, { title: string; content: React.ReactNode }> =
  {
    quickstart: {
      title: "Quickstart",
      content: (
        <article className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              Getting Started
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
              Quickstart
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Get your first comparison running in under 5 minutes.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              1. Get your API key
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign up at{" "}
              <Link
                href="/signup"
                className="text-primary underline underline-offset-2"
              >
                promptdiff.bizmarq.com/signup
              </Link>{" "}
              — free, no credit card required. Your API key will be created
              instantly.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              2. Make your first comparison
            </h2>
            <CodeBlock
              language="bash"
              filename="quickstart.sh"
              code={`curl -X POST https://promptdiff.bizmarq.com/api/v1/compare \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer pd_your_api_key_here" \\
  -d '{
    "prompt": "What is the capital of France?",
    "models": ["gpt-4o-mini", "claude-haiku-4-5"]
  }'`}
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              3. Parse the results
            </h2>
            <p className="text-sm text-muted-foreground">
              Each result includes the model output, latency in milliseconds,
              cost in USD, and token counts.
            </p>
            <CodeBlock
              language="json"
              filename="response.json"
              code={`{
  "eval_id": "eval_01j8abc123",
  "results": [
    {
      "model": "gpt-4o-mini",
      "provider": "openai",
      "output": "The capital of France is Paris.",
      "latency_ms": 612,
      "cost_usd": 0.000012,
      "input_tokens": 10,
      "output_tokens": 8,
      "total_tokens": 18
    }
  ],
  "meta": {
    "total_cost_usd": 0.000031,
    "fastest_model": "gpt-4o-mini",
    "cheapest_model": "gpt-4o-mini",
    "created_at": "2025-03-20T10:00:00Z"
  }
}`}
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Using the Python SDK
            </h2>
            <CodeBlock
              language="python"
              filename="example.py"
              code={QUICKSTART_PY}
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Using the TypeScript SDK
            </h2>
            <CodeBlock
              language="typescript"
              filename="example.ts"
              code={QUICKSTART_TS}
            />
          </div>
        </article>
      ),
    },
    authentication: {
      title: "Authentication",
      content: (
        <article className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              Getting Started
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
              Authentication
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              All API requests use Bearer token authentication.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              API Key format
            </h2>
            <p className="text-sm text-muted-foreground">
              Your API key starts with{" "}
              <code className="font-mono text-primary">pd_</code> followed by a
              unique identifier.
            </p>
            <CodeBlock
              code="pd_your_api_key_here"
              language="text"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Request header
            </h2>
            <CodeBlock
              language="http"
              code="Authorization: Bearer pd_your_api_key_here"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Get your key
            </h2>
            <p className="text-sm text-muted-foreground">
              Obtain your API key from the{" "}
              <Link
                href="/dashboard/keys"
                className="text-primary underline underline-offset-2"
              >
                API Keys page
              </Link>{" "}
              in your dashboard after signing up.
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-sm font-medium text-amber-800 mb-1">
              Security note
            </p>
            <p className="text-xs text-amber-700">
              Never expose your API key in client-side code or commit it to
              version control. Use environment variables:{" "}
              <code className="font-mono">PROMPTDIFF_API_KEY=pd_your_api_key_here</code>
            </p>
          </div>
        </article>
      ),
    },
    "api-reference": {
      title: "API Reference — Compare",
      content: (
        <article className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              API Reference
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
              POST /v1/compare
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Run a prompt against multiple LLMs simultaneously and get
              structured comparison results.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
              <span className="font-mono text-xs font-bold text-white bg-primary px-2 py-0.5 rounded">
                POST
              </span>
              <code className="text-sm font-mono text-foreground">
                https://promptdiff.bizmarq.com/api/v1/compare
              </code>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Request body
            </h2>
            <div className="space-y-3">
              {[
                {
                  name: "prompt",
                  type: "string",
                  required: true,
                  desc: "The prompt to send to each model.",
                },
                {
                  name: "models",
                  type: "string[]",
                  required: true,
                  desc: "Array of model IDs to compare. Get list from GET /v1/models.",
                },
                {
                  name: "input",
                  type: "string",
                  required: false,
                  desc: "Optional input variable to inject into the prompt context.",
                },
                {
                  name: "options.temperature",
                  type: "number",
                  required: false,
                  desc: "Sampling temperature (0-2). Default: 0.7",
                },
                {
                  name: "options.max_tokens",
                  type: "number",
                  required: false,
                  desc: "Max output tokens per model. Default: 500",
                },
              ].map((p) => (
                <div
                  key={p.name}
                  className="bg-white rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <code className="font-mono text-sm text-primary">
                      {p.name}
                    </code>
                    <span className="text-xs text-muted-foreground font-mono">
                      {p.type}
                    </span>
                    {p.required ? (
                      <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                        required
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        optional
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Example</h2>
            <CodeBlock
              language="bash"
              code={`curl -X POST https://promptdiff.bizmarq.com/api/v1/compare \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer pd_your_api_key_here" \\
  -d '{
    "prompt": "Summarize: {input}",
    "input": "The quick brown fox jumps over the lazy dog.",
    "models": ["gpt-4o-mini", "claude-haiku-4-5", "gemini-2.5-flash"],
    "options": {
      "temperature": 0.3,
      "max_tokens": 200
    }
  }'`}
            />
          </div>
        </article>
      ),
    },
    models: {
      title: "Models & Pricing",
      content: (
        <article className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              Guides
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
              Models & Pricing
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              PromptDiff charges{" "}
              <strong>LLM API cost + 40% margin</strong>. Free tier: 100
              evals/month with mini models (no card required).
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Model
                  </th>
                  <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Provider
                  </th>
                  <th className="text-right p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Input/1M
                  </th>
                  <th className="text-right p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Output/1M
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    model: "claude-sonnet-4-6",
                    provider: "Anthropic",
                    input: "$3.00",
                    output: "$15.00",
                  },
                  {
                    model: "claude-haiku-4-5",
                    provider: "Anthropic",
                    input: "$0.80",
                    output: "$4.00",
                  },
                  {
                    model: "gpt-4o",
                    provider: "OpenAI",
                    input: "$5.00",
                    output: "$15.00",
                  },
                  {
                    model: "gpt-4o-mini",
                    provider: "OpenAI",
                    input: "$0.15",
                    output: "$0.60",
                  },
                  {
                    model: "gemini-2.5-pro",
                    provider: "Google",
                    input: "$1.25",
                    output: "$10.00",
                  },
                  {
                    model: "gemini-2.5-flash",
                    provider: "Google",
                    input: "$0.15",
                    output: "$0.60",
                  },
                  {
                    model: "grok-3",
                    provider: "xAI",
                    input: "$3.00",
                    output: "$15.00",
                  },
                  {
                    model: "grok-3-mini",
                    provider: "xAI",
                    input: "$0.30",
                    output: "$0.50",
                  },
                ].map((m, i) => (
                  <tr
                    key={m.model}
                    className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                  >
                    <td className="p-3 font-mono text-xs text-foreground">
                      {m.model}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {m.provider}
                    </td>
                    <td className="p-3 text-xs font-mono text-right">
                      {m.input}
                    </td>
                    <td className="p-3 text-xs font-mono text-right">
                      {m.output}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-accent rounded-xl border border-primary/10">
            <p className="text-sm font-medium text-primary mb-1">
              Pricing note
            </p>
            <p className="text-xs text-muted-foreground">
              Prices above reflect underlying LLM provider costs and may change.
              Always use{" "}
              <code className="font-mono">GET /v1/models</code> for current
              pricing. PromptDiff charges LLM API cost + 40% margin. Free tier
              includes 100 evals/month with mini models — no credit card
              required.
            </p>
          </div>
        </article>
      ),
    },
    examples: {
      title: "Examples",
      content: (
        <article className="space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              Guides
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
              Examples
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Common usage patterns for PromptDiff.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Choosing the cheapest model
            </h2>
            <p className="text-sm text-muted-foreground">
              Compare models and programmatically select the cheapest one that
              meets a quality threshold.
            </p>
            <CodeBlock
              language="python"
              code={EXAMPLES_PY}
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Latency benchmarking
            </h2>
            <CodeBlock
              language="bash"
              code={`curl -X POST https://promptdiff.bizmarq.com/api/v1/compare \\
  -H "Authorization: Bearer pd_your_api_key_here" \\
  -d '{
    "prompt": "Respond with exactly one word: yes",
    "models": ["gpt-4o-mini", "claude-haiku-4-5", "gemini-2.5-flash", "grok-3-mini"],
    "options": { "max_tokens": 5 }
  }'`}
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              JavaScript / TypeScript
            </h2>
            <CodeBlock
              language="typescript"
              filename="compare.ts"
              code={EXAMPLES_TS}
            />
          </div>
        </article>
      ),
    },
  };

// Per-page ToC entries
const docsToc: Record<string, Array<{ label: string; id: string }>> = {
  quickstart: [
    { label: "Get your API key", id: "get-your-api-key" },
    { label: "Make your first comparison", id: "make-your-first-comparison" },
    { label: "Parse the results", id: "parse-the-results" },
    { label: "Using the Python SDK", id: "using-the-python-sdk" },
    { label: "Using the TypeScript SDK", id: "using-the-typescript-sdk" },
  ],
  authentication: [
    { label: "API Key format", id: "api-key-format" },
    { label: "Request header", id: "request-header" },
    { label: "Get your key", id: "get-your-key" },
  ],
  "api-reference": [
    { label: "Request body", id: "request-body" },
    { label: "Example", id: "example" },
  ],
  models: [
    { label: "Model pricing table", id: "model-pricing-table" },
  ],
  examples: [
    { label: "Choosing the cheapest model", id: "choosing-the-cheapest-model" },
    { label: "Latency benchmarking", id: "latency-benchmarking" },
    { label: "JavaScript / TypeScript", id: "javascript-typescript" },
  ],
};

function TableOfContents({ entries }: { entries: Array<{ label: string; id: string }> }) {
  if (entries.length === 0) return null;
  return (
    <aside className="hidden xl:block w-48 shrink-0 sticky top-24 self-start">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        On this page
      </p>
      <ul className="space-y-1.5">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors block leading-snug"
            >
              {entry.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default async function DocsSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const key = slug.join("/");
  const doc = docsContent[key];

  if (!doc) {
    notFound();
  }

  const toc = docsToc[key] ?? [];

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0 overflow-x-hidden">{doc.content}</div>
      <TableOfContents entries={toc} />
    </div>
  );
}

export async function generateStaticParams() {
  return Object.keys(docsContent).map((slug) => ({
    slug: slug.split("/"),
  }));
}
