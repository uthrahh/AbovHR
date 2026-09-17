import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
      <PageLink disabled={page <= 1} href={buildHref(page - 1)} aria-label="Previous page">
        <ArrowLeftIcon width={16} height={16} />
      </PageLink>
      <span className="px-3 text-sm text-[var(--color-text-secondary)]">
        Page {page} of {totalPages}
      </span>
      <PageLink disabled={page >= totalPages} href={buildHref(page + 1)} aria-label="Next page">
        <ArrowRightIcon width={16} height={16} />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  children,
  ...props
}: { href: string; disabled?: boolean; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (disabled) {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] opacity-40">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-sunken)]"
      {...props}
    >
      {children}
    </Link>
  );
}
