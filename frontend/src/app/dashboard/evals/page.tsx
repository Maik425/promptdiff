"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getEvals, type EvalSummary } from "@/lib/api";
import { formatCost, formatDate, truncate } from "@/lib/utils";
import { FlaskConical, ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";

const PAGE_SIZE = 20;

export default function EvalsPage() {
  const [evals, setEvals] = useState<EvalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    getEvals(PAGE_SIZE, offset)
      .then((data) => {
        setEvals(data.evals ?? []);
        setTotal(data.total ?? data.evals?.length ?? 0);
      })
      .catch(() => setEvals([]))
      .finally(() => setLoading(false));
  }, [offset]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Eval History
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All your past comparisons
          </p>
        </div>
        <Link href="/dashboard/playground">
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
            <FlaskConical className="w-4 h-4" />
            New Comparison
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Eval ID
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Prompt
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Models
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                Cost
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-64" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : evals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <FlaskConical className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No evals yet.{" "}
                    <Link
                      href="/dashboard/playground"
                      className="text-primary underline underline-offset-2"
                    >
                      Run your first comparison
                    </Link>
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              evals.map((ev) => (
                <TableRow
                  key={ev.eval_id}
                  className="border-border hover:bg-muted/20 cursor-pointer group"
                >
                  <TableCell>
                    <Link
                      href={`/dashboard/evals/${ev.eval_id}`}
                      className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      {ev.eval_id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/evals/${ev.eval_id}`}>
                      <span className="text-sm text-foreground">
                        {truncate(ev.prompt, 80)}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {ev.model_count ?? ev.models?.length ?? 0} models
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono text-sm text-muted-foreground">
                      {formatCost(ev.total_cost_usd)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(ev.created_at)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/evals/${ev.eval_id}`}>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              className="gap-1.5 h-8"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset(offset + PAGE_SIZE)}
              className="gap-1.5 h-8"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
