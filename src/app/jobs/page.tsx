import type { Metadata } from "next";
import { auth } from "@/auth";
import { searchJobs } from "@/lib/data/jobs";
import { getCandidateMatchContext, getSavedJobIdSet } from "@/lib/data/candidate";
import { computeJobMatch } from "@/lib/matching/job-match";
import { JobCard, type JobCardData } from "@/components/jobs/job-card";
import { JobSearchBar } from "@/components/jobs/job-search-bar";
import { JobFiltersDesktop, JobFiltersMobile } from "@/components/jobs/job-filters";
import { SortSelect } from "@/components/jobs/sort-select";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchIcon } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Find jobs",
  description: "Search jobs and internships by skill, location, experience, and work mode.",
};

type SearchParamsShape = Record<string, string | string[] | undefined>;

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toStr(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}) {
  const sp = await searchParams;
  const q = toStr(sp.q);
  const location = toStr(sp.location);
  const employmentType = toArray(sp.employmentType);
  const workMode = toArray(sp.workMode);
  const fresherFriendly = toStr(sp.fresherFriendly) === "true";
  const datePosted = toStr(sp.datePosted) as "24h" | "7d" | "30d" | undefined;
  const sort = (toStr(sp.sort) as "relevance" | "date" | "salary" | undefined) ?? "relevance";
  const page = Number(toStr(sp.page) ?? "1") || 1;

  const [session, results] = await Promise.all([
    auth(),
    searchJobs({ q, location, employmentType, workMode, fresherFriendly, datePosted, sort, page }),
  ]);

  let matchContext: Awaited<ReturnType<typeof getCandidateMatchContext>> = null;
  let savedJobIds = new Set<string>();
  if (session?.user?.role === "CANDIDATE") {
    matchContext = await getCandidateMatchContext(session.user.id);
    if (matchContext) savedJobIds = await getSavedJobIdSet(matchContext.profileId);
  }

  const jobCards: JobCardData[] = results.jobs.map((job) => {
    const skillNames = job.skills.map((s) => s.skill.name);
    const matchPercentage = matchContext
      ? computeJobMatch(matchContext.forMatching, {
          requiredSkillNames: skillNames,
          experienceMinYears: job.experienceMinYears,
          experienceMaxYears: job.experienceMaxYears,
          locationCity: job.locationCity,
          workMode: job.workMode,
          educationRequirement: job.educationRequirement,
        }).percentage
      : undefined;

    return {
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
    };
  });

  const hiddenParams = { employmentType, workMode, fresherFriendly: fresherFriendly ? "true" : undefined, datePosted, sort };

  function buildHref(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    employmentType.forEach((v) => params.append("employmentType", v));
    workMode.forEach((v) => params.append("workMode", v));
    if (fresherFriendly) params.set("fresherFriendly", "true");
    if (datePosted) params.set("datePosted", datePosted);
    if (sort) params.set("sort", sort);
    params.set("page", String(targetPage));
    return `/jobs?${params.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Find jobs</h1>
      <div className="mt-4">
        <JobSearchBar defaultQuery={q} defaultLocation={location} hiddenParams={hiddenParams} />
      </div>

      <div className="mt-6 flex gap-8">
        <JobFiltersDesktop />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <JobFiltersMobile resultCount={results.total} />
              <p className="text-sm text-[var(--color-text-secondary)]">
                {results.total} {results.total === 1 ? "result" : "results"}
              </p>
            </div>
            <SortSelect />
          </div>

          {jobCards.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={<SearchIcon width={28} height={28} />}
                title="No jobs match these filters"
                description="Try widening your location, removing a filter, or searching a broader keyword."
                action={<LinkButton href="/jobs">Clear filters</LinkButton>}
              />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {jobCards.map((job) => (
                <JobCard key={job.id} job={job} isSaved={savedJobIds.has(job.id)} isAuthenticated={!!session?.user} />
              ))}
            </div>
          )}

          <Pagination page={results.page} totalPages={results.totalPages} buildHref={buildHref} />
        </div>
      </div>
    </div>
  );
}
