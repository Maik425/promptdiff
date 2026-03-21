"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import {
  Users,
  BarChart3,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

interface UserSummary {
  id: string;
  email: string;
  plan: string;
  auth_provider: string;
  email_verified: boolean;
  has_payment_method: boolean;
  eval_count: number;
  total_cost_usd: number;
  created_at: string;
}

interface GlobalUsage {
  total_users: number;
  total_evals: number;
  total_cost_usd: number;
  active_users: number;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [stats, setStats] = useState<GlobalUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<{ users: UserSummary[]; total: number }>("/v1/admin/users"),
      apiFetch<GlobalUsage>("/v1/admin/usage"),
    ])
      .then(([usersData, usageData]) => {
        setUsers(usersData.users || []);
        setStats(usageData);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load admin data");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleVerifyEmail = async (userId: string, email: string) => {
    try {
      await apiFetch(`/v1/admin/users/${userId}/verify`, { method: "POST" });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, email_verified: true } : u))
      );
      toast.success(`Email verified for ${email}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to verify email");
    }
  };

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <Shield className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-700 font-medium">{error}</p>
          <p className="text-red-500 text-sm mt-1">Admin access required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Admin
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          System overview and user management
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Users</span>
            </div>
            {loading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-2xl font-bold">{stats?.total_users ?? 0}</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Evals</span>
            </div>
            {loading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-2xl font-bold">{stats?.total_evals ?? 0}</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground">Active Users</span>
            </div>
            {loading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-2xl font-bold">{stats?.active_users ?? 0}</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground">Total Revenue</span>
            </div>
            {loading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className="text-2xl font-bold">${(stats?.total_cost_usd ?? 0).toFixed(4)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 text-xs font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-2 text-xs font-medium text-muted-foreground">Auth</th>
                    <th className="text-left p-2 text-xs font-medium text-muted-foreground">Verified</th>
                    <th className="text-left p-2 text-xs font-medium text-muted-foreground">Payment</th>
                    <th className="text-right p-2 text-xs font-medium text-muted-foreground">Evals</th>
                    <th className="text-right p-2 text-xs font-medium text-muted-foreground">Cost</th>
                    <th className="text-left p-2 text-xs font-medium text-muted-foreground">Joined</th>
                    <th className="text-left p-2 text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-2 font-mono text-xs">{user.email}</td>
                      <td className="p-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {user.auth_provider}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {user.email_verified ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <span className="text-xs text-amber-500">No</span>
                        )}
                      </td>
                      <td className="p-2">
                        {user.has_payment_method ? (
                          <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Active</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-2 text-right font-mono text-xs">{user.eval_count}</td>
                      <td className="p-2 text-right font-mono text-xs">${user.total_cost_usd.toFixed(4)}</td>
                      <td className="p-2 text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        {!user.email_verified && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px] px-2"
                            onClick={() => handleVerifyEmail(user.id, user.email)}
                          >
                            Verify
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
