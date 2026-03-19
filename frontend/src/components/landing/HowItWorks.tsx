import { Terminal, LayoutGrid, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Terminal,
    step: "01",
    title: "POST your prompt",
    description:
      "Send your prompt and choose which models to compare. Include system instructions or variables as needed.",
    code: `curl -X POST \\
  https://promptdiff.bizmarq.com/api/v1/compare \\
  -H "Authorization: Bearer pd_xxx" \\
  -d '{"prompt": "...", "models": ["gpt-4o", "claude-3-5-sonnet"]}'`,
  },
  {
    icon: LayoutGrid,
    step: "02",
    title: "We run all models in parallel",
    description:
      "PromptDiff calls each model simultaneously, measuring latency, collecting tokens, and computing costs in real time.",
    code: null,
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Get structured results",
    description:
      "Receive a unified JSON response with outputs, latency, cost, and token breakdown per model. Compare and decide.",
    code: null,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            How it works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From prompt to comparison in milliseconds. One request, all the data
            you need to make the right model choice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-mono font-bold text-primary/60 uppercase tracking-widest">
                    Step {step.step}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
