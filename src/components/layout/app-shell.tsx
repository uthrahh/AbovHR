import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { dashboardPathForRole } from "@/lib/auth/dashboard-path";

/**
 * Renders the installed-app shell (minimal top bar + bottom tabs). Inert
 * (display: none) unless the page is running in PWA standalone mode — see
 * globals.css and AppShellBootstrap. Website visitors, including on a phone
 * browser, never see this; they get the unmodified Navbar/Footer.
 */
export async function AppShell() {
  const session = await auth();
  const unreadCount = session?.user
    ? await prisma.notification.count({ where: { userId: session.user.id, isRead: false } })
    : 0;

  const accountHref = session?.user ? dashboardPathForRole(session.user.role) : "/sign-in";

  return (
    <>
      <AppTopBar isAuthenticated={!!session?.user} unreadCount={unreadCount} />
      <AppBottomNav accountHref={accountHref} />
    </>
  );
}
