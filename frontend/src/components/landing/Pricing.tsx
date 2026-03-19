import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for exploration and small projects.",
    cta: "Get started free",
    href: "/signup",
    primary: false,
    features: [
      "100 evals per month",
      "All models supported",
      "Full API access",
      "JSON responses",
      "Eval history (30 days)",
    ],
  },
  {
    name: "Pay-as-you-go",
    price: "$0.005",
    period: "/eval",
    description: "For teams and production workloads.",
    cta: "Start building",
    href: "/signup",
    primary: true,
    features: [
      "Unlimited evals",
      "All models supported",
      "Full API access",
      "Volume discounts",
      "Eval history (unlimited)",
      "Priority support",
    ],
    volumeDiscounts: [
      { threshold: "1,000 evals", rate: "$0.004" },
      { threshold: "10,000 evals", rate: "$0.003" },
      { threshold: "100,000 evals", rate: "$0.002" },
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground">
            Start free. Pay only for what you use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 flex flex-col ${
                plan.primary
                  ? "border-primary bg-primary text-white shadow-xl shadow-primary/25"
                  : "border-border bg-white"
              }`}
            >
              <div className="mb-6">
                <p
                  className={`text-sm font-medium mb-1 ${
                    plan.primary ? "text-white/70" : "text-muted-foreground"
                  }`}
                >
                  {plan.name}
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span
                    className={`text-sm mb-1.5 ${
                      plan.primary ? "text-white/70" : "text-muted-foreground"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className={`text-sm mt-2 ${
                    plan.primary ? "text-white/80" : "text-muted-foreground"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 ${
                        plan.primary ? "text-white" : "text-primary"
                      }`}
                    />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              {plan.volumeDiscounts && (
                <div
                  className={`mb-6 p-4 rounded-xl ${
                    plan.primary ? "bg-white/10" : "bg-muted/50"
                  }`}
                >
                  <p
                    className={`text-xs font-medium mb-2 ${
                      plan.primary ? "text-white/70" : "text-muted-foreground"
                    }`}
                  >
                    Volume discounts
                  </p>
                  <div className="space-y-1">
                    {plan.volumeDiscounts.map((d) => (
                      <div
                        key={d.threshold}
                        className="flex justify-between text-xs"
                      >
                        <span
                          className={
                            plan.primary ? "text-white/80" : "text-foreground"
                          }
                        >
                          {d.threshold}+
                        </span>
                        <span
                          className={`font-mono font-semibold ${
                            plan.primary ? "text-white" : "text-primary"
                          }`}
                        >
                          {d.rate}/eval
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link href={plan.href}>
                <Button
                  className={`w-full ${
                    plan.primary
                      ? "bg-white text-primary hover:bg-white/90"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Note: PromptDiff pricing is separate from underlying LLM costs, which
          are billed by each provider on your behalf.
        </p>
      </div>
    </section>
  );
}
