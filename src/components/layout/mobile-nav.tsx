"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";
import { signOutAction } from "@/lib/actions/auth";

type NavLink = { href: string; label: string };

export function MobileNav({
  links,
  isAuthenticated,
  dashboardHref,
}: {
  links: NavLink[];
  isAuthenticated: boolean;
  dashboardHref: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Close the drawer on navigation. The dialog's onClose handler (below)
    // is what actually resets `open` — closing an already-closed <dialog>
    // is a no-op, so this never fires setState redundantly.
    dialogRef.current?.close();
  }, [pathname]);

  function openMenu() {
    dialogRef.current?.showModal();
    setOpen(true);
  }

  function closeMenu() {
    dialogRef.current?.close();
    setOpen(false);
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={openMenu}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-on-dark)] hover:bg-white/10"
      >
        <MenuIcon />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Site menu"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeMenu();
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-[var(--color-nav-bg)] p-0 backdrop:bg-black/50 open:flex"
      >
        <div className="flex h-full w-full flex-col p-5">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg text-[var(--color-text-on-dark)]">Menu</span>
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-on-dark)] hover:bg-white/10"
            >
              <CloseIcon />
            </button>
          </div>

          <nav aria-label="Primary" className="mt-6 flex flex-1 flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[var(--radius-sm)] px-3 py-3 text-base font-medium text-[var(--color-text-on-dark)] hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
            {isAuthenticated ? (
              <>
                <Link
                  href={dashboardHref}
                  className="rounded-[var(--radius-sm)] border border-white/20 px-4 py-3 text-center text-sm font-medium text-[var(--color-text-on-dark)]"
                >
                  Dashboard
                </Link>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="w-full rounded-[var(--radius-sm)] px-4 py-3 text-center text-sm font-medium text-[var(--color-text-on-dark)]/80 hover:bg-white/5"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-[var(--radius-sm)] border border-white/20 px-4 py-3 text-center text-sm font-medium text-[var(--color-text-on-dark)]"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-[var(--radius-sm)] bg-[var(--color-accent-decorative)] px-4 py-3 text-center text-sm font-medium text-white"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </dialog>
    </div>
  );
}
