"use client";

import Link from "next/link";
import { useState } from "react";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Menu, X } from "lucide-react";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile sidebar toggle */}
            <button
              className="md:hidden p-1.5 rounded-md hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </button>

            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <div className="flex items-end gap-[2px]"><div className="w-[3px] h-[8px] bg-white/50 rounded-[1px]" /><div className="w-[3px] h-[12px] bg-white/85 rounded-[1px]" /><div className="w-[3px] h-[10px] bg-white/65 rounded-[1px]" /></div>
              </div>
              <span className="font-semibold text-foreground">PromptDiff</span>
            </Link>
            <Separator orientation="vertical" className="h-5 hidden sm:block" />
            <span className="text-sm text-muted-foreground hidden sm:block">Docs</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed top-16 left-0 bottom-0 z-40 w-64 bg-white border-r border-border overflow-y-auto transform transition-transform duration-200 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <DocsSidebar onNavigate={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex gap-8 py-8">
          {/* Desktop sidebar */}
          <div className="hidden md:block">
            <DocsSidebar />
          </div>
          <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </div>
  );
}
