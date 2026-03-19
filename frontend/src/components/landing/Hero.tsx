"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8f7ff] via-[#f0eeff] to-[#f8f7ff]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <Badge
          variant="secondary"
          className="mb-6 px-4 py-1.5 text-xs font-medium bg-accent text-primary border-primary/20 gap-1.5"
        >
          <Zap className="w-3 h-3" />
          One API call. All models. Instant comparison.
        </Badge>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.08] mb-6">
          Compare LLM outputs
          <br />
          <span className="text-primary">across models.</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          One API call. Pick your models. Get structured comparisons of output,
          latency, cost, and token usage — side by side.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 h-12 text-base gap-2 shadow-lg shadow-primary/25"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/docs">
            <Button
              size="lg"
              variant="outline"
              className="px-8 h-12 text-base border-border hover:bg-accent"
            >
              Read the docs
            </Button>
          </Link>
        </div>

        <p className="mt-5 text-sm text-muted-foreground">
          Free 100 evals/month. No credit card required.
        </p>
      </div>
    </section>
  );
}
