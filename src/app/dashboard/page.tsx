import type { Metadata } from "next";
import Link from "next/link";
import { requireRoleOrRedirect } from "@/lib/auth/rbac";
import { getCandidateDashboardData } from "@/lib/data/dashboard";
import { StatTile } from "@/components/dashboard/stat-tile";
import { ProgressBar } from "@/components/ui/progress-bar";
import { JobCard, type JobCardData } from "@/components/jobs/job-card";
import { ApplicationStatusBadge } from "@/components/jobs/application-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { BriefcaseIcon, BookmarkIcon, BellIcon, ChartIcon, AlertIcon, SearchIcon } from "@/components/ui/icons";
import { formatSalary } from "@/lib/utils";

export const metadata: Metadata = { title: "Your dashboard" };

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await requireRoleOrRedirect(["CANDIDATE"]);
  const data = await getCandidateDashboardData(session.user.id);

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p>We couldn&apos;t load your profile. Try refreshing, or contact support if this continues.</p>
      </div>
    );
  }

  const firstName = session.user.name.split(" ")[0];

  const recommendedCards: JobCardData[] = data.recommendedJobs.map(({ job, skillNames, matchPercentage }) => ({
    id: job.id,
    slug: job.slug,
    title: job.title,
    companyName: job.company.name,
    companyVerified: job.company.verificationStatus === "VERIFIED",
    locationCity: job.locationCity,
    workMode: job.workMode,
    employmentType: job.employmentType,
    experienceMinYears: job.experienceMinYears,
    experienceMaxYears: job.experienceMaxYears,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    isSalaryDisclosed: job.isSalaryDisclosed,
    salaryCurrency: job.salaryCurrency,
    isFresherFriendly: job.isFresherFriendly,
    publishedAt: job.publishedAt,
    skillNames,
    matchPercentage,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">
        {greeting()}, {firstName}
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Here&apos;s where your job search and learning stand today.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Recommended jobs" value={data.recommendedJobs.length} href="/jobs" icon={<SearchIcon width={16} height={16} />} />
        <StatTile label="Applications" value={data.applicationCount} href="/dashboard/applications" icon={<BriefcaseIcon width={16} height={16} />} />
        <StatTile label="Interviews" value={data.interviewCount} href="/dashboard/applications" icon={<BellIcon width={16} height={16} />} />
        <StatTile label="Saved jobs" value={data.savedJobCount} href="/dashboard/saved" icon={<BookmarkIcon width={16} height={16} />} />
        <StatTile label="Learning progress" value={`${data.learningProgressPercentage}%`} href="/learn" icon={<ChartIcon width={16} height={16} />} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-[var(--color-text-primary)]">Recommended for you</h2>
              <Link href="/jobs" className="text-sm font-medium text-[var(--color-accent-text)] underline">
                View all jobs
              </Link>
            </div>
            {recommendedCards.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="No recommendations yet" description="Complete your profile so we can suggest roles that fit." />
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {recommendedCards.map((job) => (
                  <JobCard key={job.id} job={job} isAuthenticated />
                ))}
              </div>
            )}
          </section>

          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-[var(--color-text-primary)]">Recent applications</h2>
              <Link href="/dashboard/applications" className="text-sm font-medium text-[var(--color-accent-text)] underline">
                View all
              </Link>
            </div>
            {data.recentApplications.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title="No applications yet"
                  description="When you apply to a job, you'll be able to track its status here."
                  action={<LinkButton href="/jobs">Browse jobs</LinkButton>}
                />
              </div>
            ) : (
              <ul className="mt-4 flex flex-col gap-2">
                {data.recentApplications.map((app) => (
                  <li key={app.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <div className="min-w-0">
                      <Link href={`/jobs/${app.job.slug}`} className="font-medium text-[var(--color-text-primary)] hover:underline">
                        {app.job.title}
                      </Link>
                      <p className="text-sm text-[var(--color-text-secondary)]">{app.job.company.name}</p>
                    </div>
                    <ApplicationStatusBadge status={app.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Profile completeness</h2>
              <span className="text-sm font-semibold text-[var(--color-accent-text)]">{data.completeness.percentage}%</span>
            </div>
            <div className="mt-2">
              <ProgressBar percentage={data.completeness.percentage} label="Profile completeness" />
            </div>
            {data.completeness.nextAction && (
              <div className="mt-4 rounded-[var(--radius-sm)] bg-[var(--color-accent-subtle-bg)] p-3">
                <p className="text-xs font-medium text-[var(--color-text-muted)]">Recommended next step</p>
                <p className="mt-0.5 text-sm font-medium text-[var(--color-accent-text)]">{data.completeness.nextAction.label}</p>
              </div>
            )}
            <LinkButton href="/dashboard/profile" variant="secondary" size="sm" className="mt-4 w-full">
              Edit profile
            </LinkButton>
          </div>

          {data.skillGaps.length > 0 && data.closestCareerPath && (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="flex items-center gap-2">
                <AlertIcon width={16} height={16} className="text-[var(--color-warning)]" />
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Skill gaps</h2>
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                For {data.closestCareerPath.title}, based on your current skills
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {data.skillGaps.map((skill) => (
                  <li key={skill} className="rounded-full bg-[var(--color-warning-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--color-warning)]">
                    {skill}
                  </li>
                ))}
              </ul>
              <Link href={`/career/${data.closestCareerPath.slug}`} className="mt-3 inline-block text-xs font-medium text-[var(--color-accent-text)] underline">
                See full skill gap analysis
              </Link>
            </div>
          )}

          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Saved jobs</h2>
            {data.savedJobs.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Jobs you save will appear here.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2.5">
                {data.savedJobs.slice(0, 4).map((saved) => (
                  <li key={saved.id}>
                    <Link href={`/jobs/${saved.job.slug}`} className="block text-sm font-medium text-[var(--color-text-primary)] hover:underline">
                      {saved.job.title}
                    </Link>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {saved.job.company.name}
                      {saved.job.isSalaryDisclosed && saved.job.salaryMin
                        ? ` · ${formatSalary(saved.job.salaryMin, saved.job.salaryMax, saved.job.salaryCurrency)}`
                        : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
