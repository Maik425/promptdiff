import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-white border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-xs font-mono">PD</span>
              </div>
              <span className="font-semibold text-foreground">PromptDiff</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Compare LLM outputs across models with one API call.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Product
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard/playground" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Playground
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Developers
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/docs/api-reference" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/docs/models" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Models & Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Account
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sign up
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PromptDiff. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for developers who care about model quality and cost.
          </p>
        </div>
      </div>
    </footer>
  );
}
