import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  neutral: "bg-[var(--color-surface-sunken)] text-[var(--color-text-secondary)]",
  accent: "bg-[var(--color-accent-subtle-bg)] text-[var(--color-accent-text)]",
  success: "bg-[var(--color-success-subtle)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-subtle)] text-[var(--color-warning)]",
  error: "bg-[var(--color-error-subtle)] text-[var(--color-error)]",
} as const;

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: keyof typeof TONE_CLASSES;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
