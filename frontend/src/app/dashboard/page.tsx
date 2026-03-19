"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getUsage, getEvals, type UsageResponse, type EvalSummary } from "@/lib/api";
import { formatCost, formatDate, truncate } from "@/lib/utils";
import {
  BarChart3,
  FlaskConical,
  DollarSign,
  Zap,
  ArrowRight,
  History,
} from "lucide-react";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  loading: boolean;
}) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {value}
          </p>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [recentEvals, setRecentEvals] = useState<EvalSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUsage(), getEvals(5, 0)])
      .then(([u, e]) => {
        setUsage(u);
        setRecentEvals(e.evals ?? []);
      })
      .catch(() => {
        // Silently fail for MVP — show empty state
      })
      .finally(() => setLoading(false));
  }, []);

  const freeRemaining = usage?.free_evals_remaining ?? 0;
  const evalCount = usage?.eval_count ?? 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your PromptDiff overview
          </p>
        </div>
        <Link href="/dashboard/playground">
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
            <FlaskConical className="w-4 h-4" />
            New Comparison
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Evals this month"
          value={loading ? "—" : evalCount.toLocaleString()}
          icon={BarChart3}
          loading={loading}
        />
        <StatCard
          title="Free remaining"
          value={loading ? "—" : freeRemaining.toString()}
          subtitle={`of ${usage?.pricing.free_tier_limit ?? 100} free/mo`}
          icon={Zap}
          loading={loading}
        />
        <StatCard
          title="Current tier"
          value={loading ? "—" : (usage?.current_tier ?? "Free")}
          icon={BarChart3}
          loading={loading}
        />
        <StatCard
          title="Rate per eval"
          value={loading ? "—" : (usage?.current_rate_usd === 0 ? "Free" : formatCost(usage?.current_rate_usd ?? 0))}
          icon={DollarSign}
          loading={loading}
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link href="/dashboard/playground">
          <div className="group bg-white rounded-xl border border-border p-5 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-primary" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-semibold mb-1">Playground</h3>
            <p className="text-sm text-muted-foreground">
              Compare models interactively with your prompt.
            </p>
          </div>
        </Link>

        <Link href="/dashboard/evals">
          <div className="group bg-white rounded-xl border border-border p-5 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <History className="w-5 h-5 text-primary" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-semibold mb-1">Eval History</h3>
            <p className="text-sm text-muted-foreground">
              Browse and revisit your past comparisons.
            </p>
          </div>
        </Link>
      </div>

      {/* Recent evals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">
            Recent evals
          </h2>
          <Link href="/dashboard/evals">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
              View all
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : recentEvals.length === 0 ? (
          <div className="bg-white rounded-xl border border-border border-dashed p-10 text-center">
            <FlaskConical className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No evals yet. Run your first comparison in the{" "}
              <Link href="/dashboard/playground" className="text-primary underline underline-offset-2">
                Playground
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentEvals.map((ev) => (
              <Link key={ev.eval_id} href={`/dashboard/evals/${ev.eval_id}`}>
                <div className="group bg-white rounded-xl border border-border p-4 hover:border-primary/30 hover:shadow-sm transition-all flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {truncate(ev.prompt, 80)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(ev.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      {ev.model_count ?? ev.models?.length ?? 0} models
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      {formatCost(ev.total_cost_usd)}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
