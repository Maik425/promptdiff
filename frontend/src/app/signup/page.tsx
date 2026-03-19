"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signup, storeApiKey } from "@/lib/api";
import { toast } from "sonner";
import { Check } from "lucide-react";

const benefits = [
  "100 free evals per month",
  "All models: GPT, Claude, Gemini",
  "Full API access immediately",
  "No credit card required",
];

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const data = await signup(email, password);
      storeApiKey(data.api_key);
      localStorage.setItem("pd_email", email);
      toast.success("Account created! Welcome to PromptDiff.");
      router.push("/dashboard/playground");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Benefits */}
        <div className="hidden md:flex flex-col gap-6 p-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold font-mono">PD</span>
            </div>
            <span className="font-semibold text-xl text-foreground">
              PromptDiff
            </span>
          </Link>

          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              Compare models in seconds
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Stop guessing which LLM to use. Get data-driven comparisons across
              output quality, speed, and cost.
            </p>
          </div>

          <ul className="space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-foreground">{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 p-4 bg-accent rounded-xl border border-primary/10">
            <p className="text-sm font-mono text-primary/80 leading-relaxed">
              <span className="text-muted-foreground"># Your first eval</span>
              {"\n"}
              curl -X POST .../v1/compare \
              {"\n"}
              {"  "}-d &apos;&#123;&quot;models&quot;: [&quot;gpt-4o&quot;, &quot;claude-3-5-sonnet&quot;]&#125;&apos;
            </p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 md:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-white font-bold font-mono">PD</span>
              </div>
              <span className="font-semibold text-xl text-foreground">
                PromptDiff
              </span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-foreground mb-1">
                Create your account
              </h1>
              <p className="text-sm text-muted-foreground">
                Free forever. No credit card required.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="h-10"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white h-10"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  "Create account"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By signing up, you agree to our terms of service and privacy
                policy.
              </p>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
