"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  getUsage,
  apiFetch,
  updateSpendLimit,
  changePassword,
  deleteAccount,
  clearAuth,
  type UsageResponse,
} from "@/lib/api";
import {
  User,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Lock,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Spend limit editing
  const [editingLimit, setEditingLimit] = useState(false);
  const [limitInput, setLimitInput] = useState("");
  const [savingLimit, setSavingLimit] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Account deletion
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    getUsage()
      .then(setUsage)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const email = usage?.email ?? "—";
  const createdAt = usage?.created_at ?? null;
  const plan = usage?.plan ?? "free";
  const authProvider = usage?.auth_provider ?? "email";
  const hasPassword = (usage as unknown as Record<string, unknown>)?.has_password !== false;
  const hasPayment = usage?.has_payment_method ?? false;
  const spendLimit = usage?.monthly_spend_limit ?? 0;

  const handleAddPaymentMethod = async () => {
    try {
      const data = await apiFetch<{ checkout_url: string }>(
        "/v1/billing/checkout-session",
        { method: "POST" }
      );
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create checkout session"
      );
    }
  };

  const handleEditLimit = () => {
    setLimitInput(spendLimit.toFixed(2));
    setEditingLimit(true);
  };

  const handleSaveLimit = async () => {
    const value = parseFloat(limitInput);
    if (isNaN(value) || value < 0 || value > 10000) {
      toast.error("Spend limit must be between $0 and $10,000");
      return;
    }
    setSavingLimit(true);
    try {
      await updateSpendLimit(value);
      setUsage((prev) => (prev ? { ...prev, monthly_spend_limit: value } : prev));
      setEditingLimit(false);
      toast.success("Spend limit updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update spend limit");
    } finally {
      setSavingLimit(false);
    }
  };

  const handleCancelLimit = () => {
    setEditingLimit(false);
    setLimitInput("");
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Both fields are required");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCancelPassword = () => {
    setShowPasswordForm(false);
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmInput !== "DELETE") {
      toast.error('Type DELETE to confirm');
      return;
    }
    setDeletingAccount(true);
    try {
      await deleteAccount();
      clearAuth();
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account");
      setDeletingAccount(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account, billing, and preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Account */}
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
              <span className="text-sm text-muted-foreground">Sign-in methods</span>
              {loading ? (
                <Skeleton className="h-5 w-24" />
              ) : (
                <div className="flex gap-1.5">
                  {hasPassword && (
                    <Badge variant="secondary">Email & Password</Badge>
                  )}
                  {(authProvider === "google" || !hasPassword) && (
                    <Badge variant="secondary">Google</Badge>
                  )}
                </div>
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

            {/* Password change — email users only */}
            {!loading && hasPassword && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                        Password
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Change your account password.
                      </p>
                    </div>
                    {!showPasswordForm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPasswordForm(true)}
                        className="gap-1.5"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Change Password
                      </Button>
                    )}
                  </div>

                  {showPasswordForm && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          Current password
                        </label>
                        <Input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          New password
                        </label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSavePassword}
                          disabled={savingPassword}
                          className="bg-primary hover:bg-primary/90 text-white"
                        >
                          {savingPassword ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelPassword}
                          disabled={savingPassword}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
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
            <div className="flex items-start sm:items-center justify-between py-2 border-b border-border gap-4 flex-col sm:flex-row">
              <div>
                <p className="text-sm text-muted-foreground">Payment method</p>
                {!loading && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {hasPayment
                      ? "Your payment method is active. You can use all models."
                      : "Add a payment method to use premium models and exceed the free quota."}
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

            {hasPayment && (
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    Monthly spend limit
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You will not be charged beyond this amount per month.
                  </p>
                </div>
                {loading ? (
                  <Skeleton className="h-4 w-12" />
                ) : editingLimit ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min="0"
                      max="10000"
                      step="1"
                      value={limitInput}
                      onChange={(e) => setLimitInput(e.target.value)}
                      className="h-8 w-24 text-sm font-mono"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveLimit}
                      disabled={savingLimit}
                      className="h-8 bg-primary hover:bg-primary/90 text-white px-3"
                    >
                      {savingLimit ? "..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelLimit}
                      disabled={savingLimit}
                      className="h-8 px-3"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-semibold text-foreground">
                      ${spendLimit.toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditLimit}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Pricing model</span>
              <span className="text-sm text-foreground">
                LLM cost + 40% margin
              </span>
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
                onClick={() => setShowDeleteDialog(true)}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 flex-shrink-0"
              >
                Delete account
              </Button>
            </div>

            {showDeleteDialog && (
              <div className="mt-4 p-4 border border-red-200 rounded-lg bg-red-50 space-y-3">
                <p className="text-sm text-red-700 font-medium">
                  This will permanently delete your account and all associated data.
                </p>
                <p className="text-xs text-red-600">
                  Type <span className="font-mono font-bold">DELETE</span> to confirm.
                </p>
                <Input
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  placeholder="Type DELETE"
                  className="h-9 text-sm border-red-300 focus-visible:ring-red-400"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount || deleteConfirmInput !== "DELETE"}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deletingAccount ? "Deleting..." : "Delete my account"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setDeleteConfirmInput("");
                    }}
                    disabled={deletingAccount}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
