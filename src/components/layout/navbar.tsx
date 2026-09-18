import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { signOutAction } from "@/lib/actions/auth";
import { LinkButton } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { BellIcon } from "@/components/ui/icons";
import { dashboardPathForRole } from "@/lib/auth/dashboard-path";

const PRIMARY_LINKS = [
  { href: "/jobs", label: "Find jobs" },
  { href: "/career", label: "Career" },
  { href: "/learn", label: "Learn" },
  { href: "/employers", label: "For employers" },
  { href: "/resources", label: "Resources" },
];

export async function Navbar() {
  const session = await auth();
  const unreadCount = session?.user
    ? await prisma.notification.count({ where: { userId: session.user.id, isRead: false } })
    : 0;

  return (
    <header className="website-chrome sticky top-0 z-40 border-b border-[var(--color-nav-border)] bg-[var(--color-nav-bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-nav-bg)]/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-[var(--color-text-on-dark)]">
            <LogoMark />
            <span className="font-display text-lg tracking-tight">Abov</span>
          </Link>
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-1">
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-[var(--color-text-on-dark)]/85 hover:text-[var(--color-text-on-dark)] hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {session?.user ? (
            <>
              <Link
                href="/notifications"
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
                className="relative flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-on-dark)]/85 hover:text-[var(--color-text-on-dark)] hover:bg-white/5"
              >
                <BellIcon width={18} height={18} />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-[var(--color-accent-highlight)]" aria-hidden="true" />
                )}
              </Link>
              <Link
                href={dashboardPathForRole(session.user.role)}
                className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-[var(--color-text-on-dark)]/85 hover:text-[var(--color-text-on-dark)] hover:bg-white/5"
              >
                Dashboard
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-[var(--radius-sm)] border border-white/20 px-3.5 py-2 text-sm font-medium text-[var(--color-text-on-dark)] hover:bg-white/5"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-[var(--radius-sm)] px-3.5 py-2 text-sm font-medium text-[var(--color-text-on-dark)]/85 hover:text-[var(--color-text-on-dark)] hover:bg-white/5"
              >
                Sign in
              </Link>
              <LinkButton href="/sign-up" variant="onDark" size="sm">
                Get started
              </LinkButton>
            </>
          )}
        </div>

        <MobileNav
          links={PRIMARY_LINKS}
          isAuthenticated={!!session?.user}
          dashboardHref={session?.user ? dashboardPathForRole(session.user.role) : "/dashboard"}
        />
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="24" height="24" rx="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 18V8.5L13 15l5-6.5V18" stroke="var(--color-accent-highlight)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
