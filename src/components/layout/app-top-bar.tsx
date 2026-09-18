"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, MoreIcon, CloseIcon } from "@/components/ui/icons";
import { signOutAction } from "@/lib/actions/auth";

const SECONDARY_LINKS = [
  { href: "/resources", label: "Resources" },
  { href: "/employers", label: "For employers" },
  { href: "/institutions", label: "For institutions" },
  { href: "/contact", label: "Contact" },
  { href: "/legal/privacy-policy", label: "Privacy policy" },
  { href: "/legal/terms", label: "Terms of service" },
  { href: "/legal/cookie-policy", label: "Cookie policy" },
  { href: "/accessibility", label: "Accessibility" },
];

export function AppTopBar({
  isAuthenticated,
  unreadCount,
}: {
  isAuthenticated: boolean;
  unreadCount: number;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  return (
    <>
      <header
        className="app-chrome fixed inset-x-0 top-0 z-40 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]/95 px-4 backdrop-blur"
        style={{ height: "calc(var(--app-top-bar-height) + env(safe-area-inset-top))", paddingTop: "env(safe-area-inset-top)" }}
      >
        <Link href="/" className="flex items-center gap-1.5 text-[var(--color-text-primary)] no-underline">
          <LogoMark />
          <span className="font-display text-base">Abov</span>
        </Link>

        <div className="flex items-center gap-1">
          {isAuthenticated && (
            <Link
              href="/notifications"
              aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)]"
            >
              <BellIcon width={20} height={20} />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-[var(--color-accent-decorative)]" aria-hidden="true" />
              )}
            </Link>
          )}
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            aria-haspopup="dialog"
            aria-label="More"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)]"
          >
            <MoreIcon width={20} height={20} />
          </button>
        </div>
      </header>

      <dialog
        ref={dialogRef}
        aria-label="More"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-0 ml-auto h-dvh max-h-none w-[86vw] max-w-sm bg-[var(--color-surface-elevated)] p-0 backdrop:bg-black/40 open:flex open:flex-col"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4" style={{ height: "calc(var(--app-top-bar-height) + env(safe-area-inset-top))", paddingTop: "env(safe-area-inset-top)" }}>
          <span className="font-display text-base text-[var(--color-text-primary)]">More</span>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)]"
          >
            <CloseIcon width={20} height={20} />
          </button>
        </div>

        <nav aria-label="More links" className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          {SECONDARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => dialogRef.current?.close()}
              aria-current={pathname === link.href ? "page" : undefined}
              className="rounded-[var(--radius-sm)] px-3 py-3 text-sm font-medium text-[var(--color-text-primary)] no-underline hover:bg-[var(--color-surface-sunken)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-[var(--color-border)] p-3" style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}>
          {isAuthenticated ? (
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-4 py-3 text-center text-sm font-medium text-[var(--color-text-primary)]"
              >
                Sign out
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/sign-in"
                onClick={() => dialogRef.current?.close()}
                className="rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-4 py-3 text-center text-sm font-medium text-[var(--color-text-primary)] no-underline"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => dialogRef.current?.close()}
                className="rounded-[var(--radius-sm)] bg-[var(--color-accent-decorative)] px-4 py-3 text-center text-sm font-medium text-[var(--color-text-primary)] no-underline"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="24" height="24" rx="6" stroke="var(--color-accent-text)" strokeWidth="1.5" />
      <path d="M8 18V8.5L13 15l5-6.5V18" stroke="var(--color-accent-decorative)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
