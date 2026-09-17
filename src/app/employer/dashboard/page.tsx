import type { Metadata } from "next";
import Link from "next/link";
import { requireEmployerMembership } from "@/lib/auth/employer";
import { getEmployerDashboardData } from "@/lib/data/employer";
import { StatTile } from "@/components/dashboard/stat-tile";
import { ApplicationStatusBadge } from "@/components/jobs/application-status-badge";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { BriefcaseIcon, UserIcon, BellIcon, ChartIcon } from "@/components/ui/icons";
import { formatRelativeDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Employer dashboard" };

export default async function EmployerDashboardPage() {
  const { session, membership } = await requireEmployerMembership();
  const data = await getEmployerDashboardData(membership.companyId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">{membership.company.name}</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Welcome back, {session.user.name.split(" ")[0]}.</p>
        </div>
        <LinkButton href="/employer/jobs/new">Post a job</LinkButton>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Open jobs" value={data.openJobsCount} href="/employer/jobs" icon={<BriefcaseIcon width={16} height={16} />} />
        <StatTile label="Total applicants" value={data.totalApplicants} icon={<UserIcon width={16} height={16} />} />
        <StatTile label="New this week" value={data.newApplicantsThisWeek} icon={<ChartIcon width={16} height={16} />} />
        <StatTile label="Interviews scheduled" value={data.interviewsScheduled} icon={<BellIcon width={16} height={16} />} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-[var(--color-text-primary)]">Recent jobs</h2>
            <Link href="/employer/jobs" className="text-sm font-medium text-[var(--color-accent-text)] underline">
              Manage all
            </Link>
          </div>
          {data.recentJobs.length === 0 ? (
            <div className="mt-3">
              <EmptyState title="No jobs posted yet" description="Post your first job to start receiving applicants." action={<LinkButton href="/employer/jobs/new">Post a job</LinkButton>} />
            </div>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {data.recentJobs.map((job) => (
                <li key={job.id} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/employer/jobs/${job.id}`} className="font-medium text-[var(--color-text-primary)] hover:underline">
                      {job.title}
                    </Link>
                    <Badge tone={job.status === "PUBLISHED" ? "success" : job.status === "DRAFT" ? "neutral" : "warning"}>{job.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{job._count.applications} applicants</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-lg text-[var(--color-text-primary)]">Recent applicants</h2>
          {data.recentApplicants.length === 0 ? (
            <div className="mt-3">
              <EmptyState title="No applicants yet" description="Applicants will show up here as they apply to your jobs." />
            </div>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {data.recentApplicants.map((app) => (
                <li key={app.id} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">{app.candidateProfile.user.name}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {app.job.title} · {formatRelativeDate(app.appliedAt)}
                      </p>
                    </div>
                    <ApplicationStatusBadge status={app.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
