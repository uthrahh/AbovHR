import type { Metadata } from "next";
import Link from "next/link";
import { requireRoleOrRedirect } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { ApplicationStatusBadge } from "@/components/jobs/application-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { BriefcaseIcon } from "@/components/ui/icons";
import { formatRelativeDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Your applications" };

export default async function ApplicationsPage() {
  const session = await requireRoleOrRedirect(["CANDIDATE"]);

  const profile = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } });
  const applications = profile
    ? await prisma.application.findMany({
        where: { candidateProfileId: profile.id },
        include: { job: { include: { company: true } } },
        orderBy: { appliedAt: "desc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Your applications</h1>

      {applications.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<BriefcaseIcon width={28} height={28} />}
            title="No applications yet"
            description="When you apply to a job, you'll be able to track its status here."
            action={<LinkButton href="/jobs">Browse jobs</LinkButton>}
          />
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {applications.map((app) => (
            <li key={app.id} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/jobs/${app.job.slug}`} className="font-medium text-[var(--color-text-primary)] hover:underline">
                    {app.job.title}
                  </Link>
                  <p className="text-sm text-[var(--color-text-secondary)]">{app.job.company.name}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">Applied {formatRelativeDate(app.appliedAt)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <ApplicationStatusBadge status={app.status} />
                  {app.atsScore !== null && (
                    <span className="text-xs text-[var(--color-text-muted)]">ATS score: {app.atsScore}%</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
