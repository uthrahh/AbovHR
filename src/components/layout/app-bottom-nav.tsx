"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, SearchIcon, BookOpenIcon, TargetIcon, UserIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function AppBottomNav({ accountHref }: { accountHref: string }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: "Home", icon: HomeIcon, match: (p: string) => p === "/" },
    { href: "/jobs", label: "Jobs", icon: SearchIcon, match: (p: string) => p.startsWith("/jobs") },
    { href: "/learn", label: "Learn", icon: BookOpenIcon, match: (p: string) => p.startsWith("/learn") },
    { href: "/career", label: "Career", icon: TargetIcon, match: (p: string) => p.startsWith("/career") },
    { href: accountHref, label: "Account", icon: UserIcon, match: (p: string) => p.startsWith("/dashboard") || p === accountHref },
  ];

  return (
    <nav
      aria-label="App navigation"
      className="app-chrome fixed inset-x-0 bottom-0 z-40 items-stretch border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
      style={{ height: "calc(var(--app-bottom-nav-height) + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.label}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-medium no-underline",
              active ? "text-[var(--color-accent-text)]" : "text-[var(--color-text-muted)]"
            )}
          >
            <tab.icon width={22} height={22} strokeWidth={active ? 2 : 1.75} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
