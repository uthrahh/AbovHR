import type { Metadata } from "next";
import Link from "next/link";
import { requireEmployerMembership } from "@/lib/auth/employer";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { BriefcaseIcon } from "@/components/ui/icons";
import { formatRelativeDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Manage jobs" };

const STATUS_TONE: Record<string, "neutral" | "success" | "warning"> = {
  DRAFT: "neutral",
  PUBLISHED: "success",
  CLOSED: "warning",
  ARCHIVED: "neutral",
};

export default async function EmployerJobsPage() {
  const { membership } = await requireEmployerMembership();

  const jobs = await prisma.job.findMany({
    where: { companyId: membership.companyId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Jobs</h1>
        <LinkButton href="/employer/jobs/new">Post a job</LinkButton>
      </div>

      {jobs.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<BriefcaseIcon width={28} height={28} />}
            title="No jobs yet"
            description="Post your first job to start receiving applicants."
            action={<LinkButton href="/employer/jobs/new">Post a job</LinkButton>}
          />
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {jobs.map((job) => (
            <li key={job.id} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link href={`/employer/jobs/${job.id}`} className="font-medium text-[var(--color-text-primary)] hover:underline">
                    {job.title}
                  </Link>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {job._count.applications} applicant{job._count.applications === 1 ? "" : "s"} ·{" "}
                    {job.publishedAt ? `Posted ${formatRelativeDate(job.publishedAt)}` : "Not yet published"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={STATUS_TONE[job.status]}>{job.status}</Badge>
                  <Link href={`/employer/jobs/${job.id}/applicants`} className="text-sm font-medium text-[var(--color-accent-text)] underline">
                    View applicants
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
