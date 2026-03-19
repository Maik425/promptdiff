import { Badge } from "@/components/ui/badge";

const models = [
  { name: "GPT-4o", provider: "OpenAI", badge: "bg-emerald-100 text-emerald-800" },
  { name: "GPT-4o mini", provider: "OpenAI", badge: "bg-emerald-100 text-emerald-800" },
  { name: "GPT-4 Turbo", provider: "OpenAI", badge: "bg-emerald-100 text-emerald-800" },
  { name: "o1-mini", provider: "OpenAI", badge: "bg-emerald-100 text-emerald-800" },
  { name: "Claude 3.5 Sonnet", provider: "Anthropic", badge: "bg-amber-100 text-amber-800" },
  { name: "Claude 3 Opus", provider: "Anthropic", badge: "bg-amber-100 text-amber-800" },
  { name: "Claude 3 Haiku", provider: "Anthropic", badge: "bg-amber-100 text-amber-800" },
  { name: "Gemini 1.5 Pro", provider: "Google", badge: "bg-blue-100 text-blue-800" },
  { name: "Gemini 1.5 Flash", provider: "Google", badge: "bg-blue-100 text-blue-800" },
  { name: "Llama 3.1 70B", provider: "Meta", badge: "bg-purple-100 text-purple-800" },
  { name: "Mistral Large", provider: "Mistral", badge: "bg-orange-100 text-orange-800" },
  { name: "Mixtral 8x7B", provider: "Mistral", badge: "bg-orange-100 text-orange-800" },
];

export function ModelsGrid() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Supported models
          </h2>
          <p className="text-muted-foreground">
            All major providers in one comparison. More added regularly.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {models.map((m) => (
            <div
              key={m.name}
              className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-white hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <span className="text-sm font-medium text-foreground leading-snug">
                {m.name}
              </span>
              <Badge className={`text-xs w-fit ${m.badge}`}>{m.provider}</Badge>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Check{" "}
          <a href="/docs" className="text-primary underline underline-offset-2">
            the docs
          </a>{" "}
          for the complete and up-to-date model list.
        </p>
      </div>
    </section>
  );
}
