import type { ReactNode } from "react";
import Link from "next/link";

export function StatTile({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: string | number;
  href?: string;
  icon?: ReactNode;
}) {
  const content = (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">{label}</span>
        {icon && <span className="text-[var(--color-text-muted)]">{icon}</span>}
      </div>
      <p className="mt-1.5 font-display text-2xl text-[var(--color-text-primary)]">{value}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block no-underline hover:opacity-90">
        {content}
      </Link>
    );
  }
  return content;
}
