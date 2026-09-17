import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { resolveReportAction } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertIcon } from "@/components/ui/icons";
import { formatRelativeDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — reports" };

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { reporter: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Reports</h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        User-submitted reports of jobs, companies, messages, or accounts awaiting review.
      </p>

      {reports.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={<AlertIcon width={28} height={28} />} title="No reports" description="Nothing has been reported yet." />
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {reports.map((report) => (
            <li key={report.id} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {report.targetType} reported by {report.reporter.name}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{report.reason}</p>
                  {report.details && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{report.details}</p>}
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">{formatRelativeDate(report.createdAt)}</p>
                </div>
                <Badge tone={report.status === "OPEN" ? "warning" : report.status === "RESOLVED" ? "success" : "neutral"}>{report.status}</Badge>
              </div>
              {report.status === "OPEN" && (
                <div className="mt-3 flex gap-3">
                  <form action={resolveReportAction.bind(null, report.id, "RESOLVED")}>
                    <button type="submit" className="text-sm font-medium text-[var(--color-success)] underline">
                      Mark resolved
                    </button>
                  </form>
                  <form action={resolveReportAction.bind(null, report.id, "DISMISSED")}>
                    <button type="submit" className="text-sm font-medium text-[var(--color-text-muted)] underline">
                      Dismiss
                    </button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
