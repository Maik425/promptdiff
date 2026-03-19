import Link from "next/link";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-xs font-mono">PD</span>
              </div>
              <span className="font-semibold text-foreground">PromptDiff</span>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <span className="text-sm text-muted-foreground">Docs</span>
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

      {/* Content */}
      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex gap-12 py-8">
          <DocsSidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
