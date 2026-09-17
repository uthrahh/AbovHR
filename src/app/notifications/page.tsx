import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/lib/actions/notifications";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { BellIcon } from "@/components/ui/icons";
import { formatRelativeDate, cn } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await requireSession();
  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Notifications</h1>
        {unreadCount > 0 && (
          <form action={markAllNotificationsReadAction}>
            <Button type="submit" variant="ghost" size="sm">
              Mark all as read
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={<BellIcon width={28} height={28} />} title="No notifications yet" description="Updates on your applications, interviews, and learning will show up here." />
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={cn(
                "rounded-[var(--radius-md)] border p-4",
                n.isRead ? "border-[var(--color-border)] bg-[var(--color-surface)]" : "border-[var(--color-accent-decorative)]/40 bg-[var(--color-accent-subtle-bg)]"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  {n.linkUrl ? (
                    <Link href={n.linkUrl} className="font-medium text-[var(--color-text-primary)] hover:underline">
                      {n.title}
                    </Link>
                  ) : (
                    <p className="font-medium text-[var(--color-text-primary)]">{n.title}</p>
                  )}
                  <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">{n.body}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">{formatRelativeDate(n.createdAt)}</p>
                </div>
                {!n.isRead && (
                  <form action={markNotificationReadAction.bind(null, n.id)}>
                    <button type="submit" className="shrink-0 text-xs font-medium text-[var(--color-accent-text)] underline">
                      Mark read
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
