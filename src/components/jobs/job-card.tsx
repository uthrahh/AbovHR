import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPinIcon, BuildingIcon } from "@/components/ui/icons";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { formatSalary, formatRelativeDate, labelForEmploymentType, labelForWorkMode } from "@/lib/utils";

export type JobCardData = {
  id: string;
  slug: string;
  title: string;
  companyName: string;
  companyVerified: boolean;
  locationCity: string | null;
  workMode: string;
  employmentType: string;
  experienceMinYears: number | null;
  experienceMaxYears: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  isSalaryDisclosed: boolean;
  salaryCurrency: string;
  isFresherFriendly: boolean;
  publishedAt: Date | null;
  skillNames: string[];
  matchPercentage?: number;
};

export function JobCard({
  job,
  isSaved,
  isAuthenticated,
}: {
  job: JobCardData;
  isSaved?: boolean;
  isAuthenticated?: boolean;
}) {
  const salary = job.isSalaryDisclosed ? formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency) : null;
  const experience =
    job.experienceMinYears === 0 && job.experienceMaxYears === 0
      ? "Fresher"
      : job.experienceMinYears !== null
        ? `${job.experienceMinYears}–${job.experienceMaxYears ?? job.experienceMinYears} yrs`
        : null;

  return (
    <article className="group relative rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-shadow hover:shadow-[var(--shadow-md)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            <Link href={`/jobs/${job.slug}`} className="no-underline hover:underline">
              <span className="absolute inset-0" aria-hidden="true" />
              {job.title}
            </Link>
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-[var(--color-text-secondary)]">
            <BuildingIcon width={15} height={15} className="shrink-0 text-[var(--color-text-muted)]" />
            <span>{job.companyName}</span>
            {job.companyVerified && (
              <Badge tone="success" className="ml-1">
                Verified
              </Badge>
            )}
          </div>
        </div>
        {typeof job.matchPercentage === "number" && (
          <div className="relative z-10 shrink-0 text-right">
            <div className="text-lg font-semibold text-[var(--color-accent-text)]">{job.matchPercentage}%</div>
            <div className="text-[0.6875rem] text-[var(--color-text-muted)]">match</div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[var(--color-text-secondary)]">
        {job.locationCity && (
          <span className="inline-flex items-center gap-1">
            <MapPinIcon width={15} height={15} className="text-[var(--color-text-muted)]" />
            {job.locationCity} · {labelForWorkMode(job.workMode)}
          </span>
        )}
        {experience && <span>{experience}</span>}
        <span>{labelForEmploymentType(job.employmentType)}</span>
      </div>

      {salary && <p className="mt-2 text-sm font-medium text-[var(--color-text-primary)]">{salary}</p>}

      {job.skillNames.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skillNames.slice(0, 4).map((skill) => (
            <Badge key={skill} tone="neutral">
              {skill}
            </Badge>
          ))}
          {job.isFresherFriendly && <Badge tone="accent">Fresher-friendly</Badge>}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-muted)]">
          {job.publishedAt ? formatRelativeDate(job.publishedAt) : ""}
        </span>
        <SaveJobButton jobId={job.id} initialSaved={!!isSaved} isAuthenticated={!!isAuthenticated} />
      </div>
    </article>
  );
}
