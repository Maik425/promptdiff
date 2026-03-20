import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

const sections = [
  { id: "service-description", title: "1. Service Description" },
  { id: "account-terms", title: "2. Account Terms" },
  { id: "acceptable-use", title: "3. Acceptable Use" },
  { id: "billing-payment", title: "4. Billing & Payment" },
  { id: "api-usage", title: "5. API Usage" },
  { id: "intellectual-property", title: "6. Intellectual Property" },
  { id: "third-party-services", title: "7. Third-Party Services" },
  { id: "ai-generated-content", title: "8. AI-Generated Content Disclaimer" },
  { id: "data-privacy", title: "9. Data & Privacy" },
  { id: "limitation-of-liability", title: "10. Limitation of Liability" },
  { id: "termination", title: "11. Termination" },
  { id: "changes-to-terms", title: "12. Changes to Terms" },
  { id: "governing-law", title: "13. Governing Law" },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs font-mono">PD</span>
            </div>
            <span className="font-semibold text-foreground">PromptDiff</span>
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 w-full py-12">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            Legal
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: March 20, 2026
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="mb-10 p-4 bg-accent rounded-xl border border-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Contents
          </p>
          <ul className="space-y-1.5">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="prose prose-sm max-w-none">
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            These Terms of Service (&quot;Terms&quot;) govern your use of the PromptDiff
            service operated by Bizmarq (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), accessible at{" "}
            <a
              href="https://promptdiff.bizmarq.com"
              className="text-primary underline underline-offset-2"
            >
              promptdiff.bizmarq.com
            </a>
            . By creating an account or using the API, you agree to these Terms.
          </p>

          {/* 1. Service Description */}
          <h2
            id="service-description"
            className="text-xl font-semibold text-foreground mt-10 mb-3 scroll-mt-20"
          >
            1. Service Description
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            PromptDiff is an API and web dashboard that lets you compare outputs from
            multiple large language models (LLMs) in a single request. We route your
            prompts to third-party LLM providers (such as Anthropic, OpenAI, Google,
            and Grok) and return structured results including output text, latency,
            token counts, and cost.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We act as an intermediary between you and the LLM providers. We do not
            host or run the models ourselves.
          </p>

          {/* 2. Account Terms */}
          <h2
            id="account-terms"
            className="text-xl font-semibold text-foreground mt-10 mb-3 scroll-mt-20"
          >
            2. Account Terms
          </h2>
          <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5">
            <li>
              You must provide a valid email address to create an account.
            </li>
            <li>
              You are responsible for keeping your account credentials and API keys
              secure. Do not share your API key with unauthorized parties.
            </li>
            <li>
              You are responsible for all activity that occurs under your account,
              including API calls made with your key.
            </li>
            <li>
              You must be at least 18 years old (or the age of majority in your
              jurisdiction) to use the service.
            </li>
            <li>
              One person or entity may not maintain more than one free account.
            </li>
          </ul>

          {/* 3. Acceptable Use */}
          <h2
            id="acceptable-use"
            className="text-xl font-semibold text-foreground mt-10 mb-3 scroll-mt-20"
          >
            3. Acceptable Use
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            You agree not to use PromptDiff to:
          </p>
          <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5 mb-3">
            <li>Violate any applicable law or regulation.</li>
            <li>
              Generate content that is illegal, harmful, abusive, or violates the
              acceptable use policies of the underlying LLM providers.
            </li>
            <li>
              Attempt to reverse-engineer, probe, or extract model weights or
              proprietary information from any LLM provider through our service.
            </li>
            <li>
              Interfere with, disrupt, or overload the service or its
              infrastructure.
            </li>
            <li>
              Resell or redistribute access to the service without our written
              consent.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We may suspend or terminate your account if we reasonably believe you
            are violating these terms.
          </p>

          {/* 4. Billing & Payment */}
          <h2
            id="billing-payment"
            className="text-xl font-semibold text-foreground mt-10 mb-3 scroll-mt-20"
          >
            4. Billing & Payment
          </h2>
          <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5">
            <li>
              <strong className="text-foreground">Free tier:</strong> All accounts
              receive 100 evaluations per month at no cost, limited to select
              models.
            </li>
            <li>
              <strong className="text-foreground">Pay-as-you-go:</strong> Usage
              beyond the free tier is billed based on actual LLM provider costs
              plus a 40% service margin. Prices per model are listed on our{" "}
              <Link
                href="/docs/models"
                className="text-primary underline underline-offset-2"
              >
                Models & Pricing
              </Link>{" "}
              page.
            </li>
            <li>
              Payments are processed through Stripe. By adding a payment method,
              you agree to Stripe&apos;s{" "}
              <a
                href="https://stripe.com/legal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                Terms of Service
              </a>
              .
            </li>
            <li>
              Usage charges are calculated in real time and billed monthly. You can
              view your current usage in the dashboard at any time.
            </li>
            <li>
              <strong className="text-foreground">Refunds:</strong> Because we incur
              real costs from LLM providers when processing your requests, charges
              for completed evaluations are non-refundable. If you believe there
              was a billing error, contact us within 30 days.
            </li>
          </ul>

          {/* 5. API Usage */}
          <h2
            id="api-usage"
            className="text-xl font-semibold text-foreground mt-10 mb-3 scroll-mt-20"
          >
            5. API Usage
          </h2>
          <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5">
            <li>
              Rate limits apply to all API endpoints to ensure fair use and service
              stability. Current limits are documented in the{" "}
              <Link
                href="/docs/api-reference"
                className="text-primary underline underline-offset-2"
              >
                API Reference
              </Link>
              .
            </li>
            <li>
              We reserve the right to throttle or temporarily restrict access if
              your usage patterns risk degrading the service for other users.
            </li>
            <li>
              We strive for high availability but do not guarantee 100% uptime. The
              service depends on third-party LLM providers whose availability is
              outside our control.
            </li>
          </ul>

          {/* 6. Intellectual Property */}
          <h2
            id="intellectual-property"
            className="text-xl font-semibold text-foreground mt-10 mb-3 scroll-mt-20"
          >
            6. Intellectual Property
          </h2>
          <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5">
            <li>
              <strong className="text-foreground">Your content:</strong> You retain
              all rights to the prompts you submit and the outputs you receive. We
              do not claim ownership over your inputs or the generated outputs.
            </li>
            <li>
              <strong className="text-foreground">Our service:</strong> The
              PromptDiff platform, API, documentation, and branding are owned by
              Bizmarq. You may not copy, modify, or distribute them without
              permission.
            </li>
            <li>
              We may use anonymized, aggregated usage data (not your prompts or
              outputs) to improve the service.
            </li>
          </ul>

          {/* 7. Third-Party Services */}
          <h2
            id="third-party-services"
            className="text-xl font-semibold text-foreground mt-10 mb-3 scroll-mt-20"
          >
            7. Third-Party Services
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            PromptDiff relies on third-party LLM providers to generate outputs. When
            you submit a prompt, it is sent to the providers of the models you
            selected (e.g., Anthropic, OpenAI, Google, Grok).
          </p>
          <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5">
            <li>
              Outputs are subject to each provider&apos;s terms of service and usage
              policies.
            </li>
            <li>
              We are not responsible for the content, accuracy, or availability of
              third-party model outputs.
            </li>
            <li>
              If a provider changes their pricing, availability, or terms, we may
              need to adjust our service accordingly.
            </li>
          </ul>

          {/* 8. AI-Generated Content Disclaimer */}
          <h2
            id="ai-generated-content"
            className="text-xl font-semibold text-foreground mt-10 mb-3 scroll-mt-20"
          >
            8. AI-Generated Content Disclaimer
          </h2>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-3">
            <p className="text-sm text-amber-900 leading-relaxed font-medium">
              All outputs returned by PromptDiff are generated by third-party AI
              models. These outputs may be inaccurate, incomplete, biased, or
              otherwise flawed. You are solely responsible for reviewing,
              validating, and determining the appropriateness of any AI-generated
              content before relying on it.
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            PromptDiff does not verify, endorse, or guarantee the accuracy of any
            model output. AI-generated content should not be used as a substitute
            for professional advice (legal, medical, financial, or otherwise).
          </p>

          {/* 9. Data & Privacy */}
          <h2
            id="data-privacy"
            className="text-xl font-semibold text-foreground mt-10 mb-3 scroll-mt-20"
          >
            9. Data & Privacy
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your privacy matters to us. Please review our{" "}
            <Link
              href="/privacy"
              className="text-primary underline underline-offset-2"
            >
              Privacy Policy
            </Link>{" "}
            for details on what data we collect, how we use it, and your rights
            regarding your data.
          </p>

          {/* 10. Limitation of Liability */}
          <h2
            id="limitation-of-liability"
            className="text-xl font-semibold text-foreground mt-10 mb-3 scroll-mt-20"
          >
            10. Limitation of Liability
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            To the maximum extent permitted by applicable law:
          </p>
          <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5">
            <li>
              The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties
              of any kind, whether express or implied.
            </li>
            <li>
              We do not warrant that the service will be uninterrupted, error-free,
              or secure.
            </li>
            <li>
              In no event shall Bizmarq be liable for any indirect, incidental,
              special, consequential, or punitive damages, or any loss of profits
              or revenue, arising from your use of the service.
            </li>
            <li>
              Our total aggregate liability for any claims related to the service
              shall not exceed the amount you paid us in the 12 months preceding
              the claim.
            </li>
          </ul>

          {/* 11. Termination */}
          <h2
            id="termination"
            className="text-xl font-semibold text-foreground mt-10 mb-3 scroll-mt-20"
          >
            11. Termination
          </h2>
          <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5">
            <li>
              You may close your account at any time from the dashboard settings.
            </li>
            <li>
              We may suspend or terminate your account if you violate these Terms,
              engage in abusive behavior, or if required by law.
            </li>
            <li>
              Upon termination, your right to use the service ceases immediately.
              We may delete your data in accordance with our Privacy Policy.
            </li>
            <li>
              Any outstanding charges at the time of termination remain payable.
            </li>
          </ul>

          {/* 12. Changes to Terms */}
          <h2
            id="changes-to-terms"
            className="text-xl font-semibold text-foreground mt-10 mb-3 scroll-mt-20"
          >
            12. Changes to Terms
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We may update these Terms from time to time. When we make significant
            changes, we will notify you by email or by posting a notice in the
            dashboard. Continued use of the service after changes take effect
            constitutes acceptance of the updated Terms.
          </p>

          {/* 13. Governing Law */}
          <h2
            id="governing-law"
            className="text-xl font-semibold text-foreground mt-10 mb-3 scroll-mt-20"
          >
            13. Governing Law
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            These Terms are governed by and construed in accordance with the laws of
            Japan. Any disputes arising from these Terms or your use of the service
            shall be subject to the exclusive jurisdiction of the Tokyo District
            Court.
          </p>

          {/* Contact */}
          <div className="mt-12 p-4 bg-accent rounded-xl border border-border">
            <p className="text-sm font-medium text-foreground mb-1">
              Questions about these terms?
            </p>
            <p className="text-sm text-muted-foreground">
              Contact us at{" "}
              <a
                href="mailto:mai.takano@east-cloud.jp"
                className="text-primary underline underline-offset-2"
              >
                mai.takano@east-cloud.jp
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
