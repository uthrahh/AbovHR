import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SpinnerIcon } from "@/components/ui/icons";

const VARIANT_CLASSES = {
  // Black text on the brighter brand orange clears WCAG AA (4.86:1) — black
  // on the darker --color-accent-text would not (3.44:1), so the fill uses
  // --color-accent-decorative here rather than the usual text-safe shade.
  primary:
    "bg-[var(--color-accent-decorative)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-text)] border border-transparent",
  secondary:
    "bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-sunken)]",
  ghost:
    "bg-transparent text-[var(--color-text-primary)] border border-transparent hover:bg-[var(--color-surface-sunken)]",
  danger:
    "bg-[var(--color-error)] text-white border border-transparent hover:opacity-90",
  onDark:
    "bg-[var(--color-accent-decorative)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-text)] border border-transparent",
} as const;

const SIZE_CLASSES = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-[0.9375rem] px-4 py-2.5 gap-2",
  lg: "text-base px-5 py-3 gap-2",
} as const;

type CommonProps = {
  variant?: keyof typeof VARIANT_CLASSES;
  size?: keyof typeof SIZE_CLASSES;
  loading?: boolean;
  className?: string;
};

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type LinkButtonProps = CommonProps & {
  href: string;
  children?: React.ReactNode;
  target?: string;
  rel?: string;
  "aria-label"?: string;
};

const baseClasses =
  "inline-flex items-center justify-center rounded-[var(--radius-sm)] font-medium transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(baseClasses, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <SpinnerIcon width={16} height={16} />}
      {children}
    </button>
  );
});

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(baseClasses, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}
