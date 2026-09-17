import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] px-6 py-14 text-center">
      {icon && <div className="text-[var(--color-text-muted)]">{icon}</div>}
      <h2 className="font-display text-lg text-[var(--color-text-primary)]">{title}</h2>
      {description && <p className="max-w-sm text-sm text-[var(--color-text-secondary)]">{description}</p>}
      {action}
    </div>
  );
}
