import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getJobBySlug, getSimilarJobs } from "@/lib/data/jobs";
import { getCandidateMatchContext, getSavedJobIdSet } from "@/lib/data/candidate";
import { prisma } from "@/lib/prisma";
import { computeJobMatch } from "@/lib/matching/job-match";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { ApplyPanel } from "@/components/jobs/apply-panel";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { JobCard, type JobCardData } from "@/components/jobs/job-card";
import { MapPinIcon, BuildingIcon, ExternalLinkIcon, TargetIcon } from "@/components/ui/icons";
import { formatSalary, formatRelativeDate, labelForEmploymentType, labelForWorkMode } from "@/lib/utils";

const EMPLOYMENT_TYPE_SCHEMA: Record<string, string> = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  INTERNSHIP: "INTERN",
  APPRENTICESHIP: "OTHER",
  CONTRACT: "CONTRACTOR",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return {};
  const description = job.description.slice(0, 155);
  return {
    title: `${job.title} at ${job.company.name}`,
    description,
    openGraph: { title: `${job.title} at ${job.company.name}`, description },
  };
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job || job.status !== "PUBLISHED") notFound();

  const session = await auth();
  const skillNames = job.skills.map((s) => s.skill.name);

  let matchContext: Awaited<ReturnType<typeof getCandidateMatchContext>> = null;
  let isSaved = false;
  let alreadyApplied = false;

  if (session?.user?.role === "CANDIDATE") {
    matchContext = await getCandidateMatchContext(session.user.id);
    if (matchContext) {
      const savedIds = await getSavedJobIdSet(matchContext.profileId);
      isSaved = savedIds.has(job.id);
      const existingApplication = await prisma.application.findUnique({
        where: { jobId_candidateProfileId: { jobId: job.id, candidateProfileId: matchContext.profileId } },
      });
      alreadyApplied = !!existingApplication && existingApplication.status !== "WITHDRAWN";
    }
  }

  const match = matchContext
    ? computeJobMatch(matchContext.forMatching, {
        requiredSkillNames: skillNames,
        experienceMinYears: job.experienceMinYears,
        experienceMaxYears: job.experienceMaxYears,
        locationCity: job.locationCity,
        workMode: job.workMode,
        educationRequirement: job.educationRequirement,
      })
    : null;

  const similar = await getSimilarJobs(
    job.id,
    job.companyId,
    job.skills.map((s) => s.skillId)
  );
  const similarCards: JobCardData[] = similar.map((j) => ({
    id: j.id,
    slug: j.slug,
    title: j.title,
    companyName: j.company.name,
    companyVerified: j.company.verificationStatus === "VERIFIED",
    locationCity: j.locationCity,
    workMode: j.workMode,
    employmentType: j.employmentType,
    experienceMinYears: j.experienceMinYears,
    experienceMaxYears: j.experienceMaxYears,
    salaryMin: j.salaryMin,
    salaryMax: j.salaryMax,
    isSalaryDisclosed: j.isSalaryDisclosed,
    salaryCurrency: j.salaryCurrency,
    isFresherFriendly: j.isFresherFriendly,
    publishedAt: j.publishedAt,
    skillNames: j.skills.map((s) => s.skill.name),
  }));

  const salary = job.isSalaryDisclosed ? formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.publishedAt?.toISOString(),
    validThrough: job.applicationDeadline?.toISOString(),
    employmentType: EMPLOYMENT_TYPE_SCHEMA[job.employmentType],
    hiringOrganization: {
      "@type": "Organization",
      name: job.company.name,
      sameAs: job.company.websiteUrl ?? undefined,
    },
    jobLocation: job.locationCity
      ? {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.locationCity,
            addressRegion: job.locationState ?? undefined,
            addressCountry: "IN",
          },
        }
      : undefined,
    jobLocationType: job.workMode === "REMOTE" ? "TELECOMMUTE" : undefined,
    baseSalary:
      job.isSalaryDisclosed && job.salaryMin
        ? {
            "@type": "MonetaryAmount",
            currency: job.salaryCurrency,
            value: { "@type": "QuantitativeValue", minValue: job.salaryMin, maxValue: job.salaryMax ?? job.salaryMin, unitText: "YEAR" },
          }
        : undefined,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-text-muted)]">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/jobs" className="hover:underline">
              Jobs
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-[var(--color-text-secondary)]">{job.title}</li>
        </ol>
      </nav>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">{job.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-text-secondary)]">
                <Link href={`/companies/${job.company.slug}`} className="inline-flex items-center gap-1.5 font-medium hover:underline">
                  <BuildingIcon width={15} height={15} />
                  {job.company.name}
                </Link>
                {job.company.verificationStatus === "VERIFIED" && <Badge tone="success">Verified employer</Badge>}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]">
                {job.locationCity && (
                  <span className="inline-flex items-center gap-1">
                    <MapPinIcon width={15} height={15} />
                    {job.locationCity} · {labelForWorkMode(job.workMode)}
                  </span>
                )}
                <span>{labelForEmploymentType(job.employmentType)}</span>
                {job.publishedAt && <span>Posted {formatRelativeDate(job.publishedAt)}</span>}
              </div>
            </div>
            <SaveJobButton jobId={job.id} initialSaved={isSaved} isAuthenticated={!!session?.user} />
          </div>

          {salary && <p className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">{salary} / year</p>}

          <div className="mt-4 flex flex-wrap gap-1.5">
            {skillNames.map((s) => (
              <Badge key={s} tone="neutral">
                {s}
              </Badge>
            ))}
            {job.isFresherFriendly && <Badge tone="accent">Fresher-friendly</Badge>}
          </div>

          {match && (
            <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-5">
              <div className="flex items-center gap-2">
                <TargetIcon width={18} height={18} className="text-[var(--color-accent-text)]" />
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {match.percentage}% match — based on your profile, skills, and preferences
                </h2>
              </div>
              <ul className="mt-3 flex flex-col gap-2">
                {match.factors.map((f) => (
                  <li key={f.id} className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-[var(--color-text-secondary)]">{f.detail}</span>
                    <span className="shrink-0 font-medium text-[var(--color-text-primary)]">{Math.round(f.score * 100)}%</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/profile" className="mt-3 inline-block text-xs font-medium text-[var(--color-accent-text)] underline">
                Improve your match by completing your profile
              </Link>
            </div>
          )}

          <section className="mt-8">
            <h2 className="font-display text-lg text-[var(--color-text-primary)]">About this role</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-text-secondary)]">{job.description}</p>
          </section>

          {job.responsibilities && (
            <section className="mt-6">
              <h2 className="font-display text-lg text-[var(--color-text-primary)]">Responsibilities</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-text-secondary)]">{job.responsibilities}</p>
            </section>
          )}

          {job.requirements && (
            <section className="mt-6">
              <h2 className="font-display text-lg text-[var(--color-text-primary)]">Requirements</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-text-secondary)]">{job.requirements}</p>
            </section>
          )}

          {job.educationRequirement && (
            <section className="mt-6">
              <h2 className="font-display text-lg text-[var(--color-text-primary)]">Education</h2>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{job.educationRequirement}</p>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            {job.applicationMethod === "EASY_APPLY" ? (
              <ApplyPanel
                jobId={job.id}
                jobSlug={job.slug}
                isAuthenticated={!!session?.user}
                isCandidate={session?.user?.role === "CANDIDATE"}
                alreadyApplied={alreadyApplied}
              />
            ) : (
              <LinkButton href={job.externalApplyUrl ?? "#"} target="_blank" rel="noopener noreferrer" size="lg" className="w-full">
                Apply on company site
                <ExternalLinkIcon width={16} height={16} />
              </LinkButton>
            )}
            {job.applicationDeadline && (
              <p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">
                Applications close {job.applicationDeadline.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
          </div>

          {job.company.about && (
            <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">About {job.company.name}</h2>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{job.company.about}</p>
              <Link href={`/companies/${job.company.slug}`} className="mt-3 inline-block text-sm font-medium text-[var(--color-accent-text)] underline">
                View company profile
              </Link>
            </div>
          )}
        </aside>
      </div>

      {similarCards.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl text-[var(--color-text-primary)]">Similar jobs</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {similarCards.map((j) => (
              <JobCard key={j.id} job={j} isAuthenticated={!!session?.user} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
