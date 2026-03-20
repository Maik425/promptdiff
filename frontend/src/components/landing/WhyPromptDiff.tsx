export function WhyPromptDiff() {
  const faqs = [
    {
      question: "What is PromptDiff?",
      answer:
        "PromptDiff is an API that compares LLM outputs across multiple models (Claude, GPT-4o, Gemini, Grok) with a single API call. It returns structured results including output text, latency, cost, and token usage for each model.",
    },
    {
      question: "How much does PromptDiff cost?",
      answer:
        "PromptDiff offers 100 free evaluations per month with no credit card required. After the free tier, pricing is based on actual LLM API costs plus a 40% margin. Mini models (Claude Haiku, GPT-4o-mini, Gemini Flash, Grok Mini) are available in the free tier.",
    },
    {
      question: "Which LLM models does PromptDiff support?",
      answer:
        "PromptDiff supports 8 models from 4 providers: Claude Sonnet 4.6 and Haiku 4.5 (Anthropic), GPT-4o and GPT-4o-mini (OpenAI), Gemini 2.5 Pro and Flash (Google), and Grok 3 and Grok 3 Mini (xAI).",
    },
    {
      question: "Does PromptDiff have an SDK?",
      answer:
        "Yes, PromptDiff provides both Python and TypeScript SDKs. You can also use the REST API directly with any HTTP client like curl or fetch.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="bg-white border-t border-border py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Why PromptDiff */}
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            Why PromptDiff
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
            The fastest way to benchmark LLM models
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed mb-10">
            Choosing between Claude, GPT-4o, Gemini, and Grok for your AI application
            means running each model separately, collecting results manually, and
            comparing them by hand. PromptDiff eliminates that friction — one API
            call returns every model's output, latency, token count, and cost side
            by side.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                heading: "Cross-model comparison in one call",
                body: "Send your prompt once. PromptDiff fans it out to every model in parallel and returns all results in a single structured response.",
              },
              {
                heading: "Real-time cost and latency tracking",
                body: "Every response includes exact token counts, cost in USD, and latency in milliseconds — so you always know which model is fastest and cheapest for your workload.",
              },
              {
                heading: "Supports all major providers",
                body: "Claude Sonnet 4.6 and Haiku 4.5 from Anthropic, GPT-4o and GPT-4o-mini from OpenAI, Gemini 2.5 Pro and Flash from Google, and Grok 3 and Grok 3 Mini from xAI.",
              },
              {
                heading: "Python and TypeScript SDKs",
                body: "First-class SDKs for Python and TypeScript. Drop in the client, pass your prompt and model list, and iterate on results in minutes.",
              },
              {
                heading: "Free tier — no credit card",
                body: "100 evaluations per month free. Mini models (Claude Haiku, GPT-4o-mini, Gemini Flash, Grok Mini) are included. No credit card required to start.",
              },
              {
                heading: "Usage-based pricing",
                body: "After the free tier, pay only for what you use. Pricing is LLM provider cost plus a 40% margin — transparent and predictable with a configurable monthly spend limit.",
              },
            ].map((item) => (
              <div key={item.heading} className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {item.heading}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            FAQ
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-8">
            Frequently asked questions
          </h2>
          <dl className="space-y-6 max-w-3xl">
            {faqs.map((faq) => (
              <div key={faq.question} className="border-b border-border pb-6 last:border-0 last:pb-0">
                <dt className="text-sm font-semibold text-foreground mb-2">
                  {faq.question}
                </dt>
                <dd className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
