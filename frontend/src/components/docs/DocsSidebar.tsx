"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const docsNav = [
  {
    group: "Getting Started",
    items: [
      { label: "Overview", href: "/docs" },
      { label: "Quickstart", href: "/docs/quickstart" },
      { label: "Authentication", href: "/docs/authentication" },
    ],
  },
  {
    group: "API Reference",
    items: [
      { label: "Compare", href: "/docs/api-reference" },
      { label: "Models", href: "/docs/api-reference/models" },
      { label: "Evals", href: "/docs/api-reference/evals" },
      { label: "Usage", href: "/docs/api-reference/usage" },
    ],
  },
  {
    group: "Guides",
    items: [
      { label: "Models & Pricing", href: "/docs/models" },
      { label: "Examples", href: "/docs/examples" },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-6 pr-4">
      <nav className="space-y-6">
        {docsNav.map((group) => (
          <div key={group.group}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {group.group}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/docs"
                    ? pathname === "/docs"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block px-3 py-1.5 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
