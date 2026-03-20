"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { clearAuth as clearAuthFn } from "@/lib/api";
import {
  LayoutDashboard,
  FlaskConical,
  History,
  Key,
  BookOpen,
  LogOut,
  ChevronRight,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Playground",
    href: "/dashboard/playground",
    icon: FlaskConical,
  },
  {
    label: "Eval History",
    href: "/dashboard/evals",
    icon: History,
  },
  {
    label: "API Keys",
    href: "/dashboard/keys",
    icon: Key,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    clearAuthFn();
    toast.success("Signed out");
    router.push("/login");
  };

  return (
    <aside className="w-56 shrink-0 bg-sidebar flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs font-mono">PD</span>
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">
            PromptDiff
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all group",
                isActive
                  ? "bg-sidebar-accent text-white font-medium"
                  : "text-sidebar-foreground/60 hover:text-white hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3 h-3 text-white/50" />
              )}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-sidebar-border">
          <Link
            href="/docs"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:text-white hover:bg-sidebar-accent/50 transition-all"
          >
            <BookOpen className="w-4 h-4 flex-shrink-0" />
            <span>Docs</span>
          </Link>
        </div>
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/50 hover:text-white hover:bg-sidebar-accent/50 transition-all w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
