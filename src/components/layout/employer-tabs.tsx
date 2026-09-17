"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/employer/dashboard", label: "Overview" },
  { href: "/employer/jobs", label: "Jobs" },
  { href: "/employer/jobs/new", label: "Post a job" },
  { href: "/employer/company", label: "Company" },
];

export function EmployerTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Employer sections" className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {TABS.map((tab) => {
          const active = pathname === tab.href || (tab.href !== "/employer/dashboard" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium",
                active
                  ? "border-[var(--color-accent-decorative)] text-[var(--color-text-primary)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
