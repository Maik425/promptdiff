"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { getUsage, type UsageResponse } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  User,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsage()
      .then(setUsage)
      .catch(() => {
        // Silently handle — show placeholder data
      })
      .finally(() => setLoading(false));
  }, []);

  const email =
    usage?.email ??
    (typeof window !== "undefined"
      ? localStorage.getItem("pd_email") ?? "you@example.com"
      : "you@example.com");

  const createdAt = usage?.created_at ?? null;
  const plan = usage?.current_tier ?? "Free";
  const hasPayment = usage?.has_payment_method ?? false;
  const spendLimit = usage?.monthly_spend_limit_usd ?? 50;

  const handleAddPaymentMethod = () => {
    // Placeholder — will call POST /v1/billing/checkout-session
    toast.info("Billing integration coming soon. Stay tuned!");
  };

  const handleDeleteAccount = () => {
    // Placeholder — not implemented
    toast.error("Account deletion is not yet available. Contact support.");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account, billing, and preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Account info */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Email</span>
              {loading ? (
                <Skeleton className="h-4 w-40" />
              ) : (
                <span className="text-sm font-medium text-foreground">
                  {email}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Plan</span>
              {loading ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                <Badge variant="secondary" className="capitalize">
                  {plan}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">
                Member since
              </span>
              {loading ? (
                <Skeleton className="h-4 w-28" />
              ) : (
                <span className="text-sm text-foreground">
                  {createdAt ? formatDate(createdAt) : "—"}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Current plan</span>
              <span className="text-sm font-medium text-foreground">
                {loading ? <Skeleton className="h-4 w-12 inline-block" /> : plan}
              </span>
            </div>

            <div className="flex items-start sm:items-center justify-between py-2 border-b border-border gap-4 flex-col sm:flex-row">
              <div>
                <p className="text-sm text-muted-foreground">Payment method</p>
                {!loading && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {hasPayment
                      ? "Your payment method is active."
                      : "No payment method on file."}
                  </p>
                )}
              </div>
              {loading ? (
                <Skeleton className="h-8 w-28" />
              ) : hasPayment ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    Active
                  </Badge>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={handleAddPaymentMethod}
                  className="bg-primary hover:bg-primary/90 text-white gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Add Payment Method
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  Monthly spend limit
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You will not be charged beyond this amount.
                </p>
              </div>
              {loading ? (
                <Skeleton className="h-4 w-12" />
              ) : (
                <span className="text-sm font-mono font-semibold text-foreground">
                  ${spendLimit.toFixed(2)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Danger zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Delete account
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently delete your account and all data. This cannot be
                  undone.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAccount}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 flex-shrink-0"
              >
                Delete account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
