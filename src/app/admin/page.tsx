import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StatTile } from "@/components/dashboard/stat-tile";
import { UserIcon, BriefcaseIcon, BuildingIcon, AlertIcon } from "@/components/ui/icons";
import { formatRelativeDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin overview" };

export default async function AdminOverviewPage() {
  const [userCount, jobCount, companyCount, openReportCount, recentAudit] = await Promise.all([
    prisma.user.count(),
    prisma.job.count({ where: { status: "PUBLISHED" } }),
    prisma.company.count(),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { actor: true } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Admin overview</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Users" value={userCount} href="/admin/users" icon={<UserIcon width={16} height={16} />} />
        <StatTile label="Published jobs" value={jobCount} href="/admin/jobs" icon={<BriefcaseIcon width={16} height={16} />} />
        <StatTile label="Companies" value={companyCount} icon={<BuildingIcon width={16} height={16} />} />
        <StatTile label="Open reports" value={openReportCount} href="/admin/reports" icon={<AlertIcon width={16} height={16} />} />
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg text-[var(--color-text-primary)]">Recent admin activity</h2>
        {recentAudit.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">No admin actions recorded yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {recentAudit.map((entry) => (
              <li key={entry.id} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm">
                <span className="font-medium text-[var(--color-text-primary)]">{entry.actor.name}</span>{" "}
                <span className="text-[var(--color-text-secondary)]">
                  {entry.action.replace(/\./g, " ")} · {entry.targetType} · {formatRelativeDate(entry.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
