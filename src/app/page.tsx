import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { searchJobs } from "@/lib/data/jobs";
import { JobCard, type JobCardData } from "@/components/jobs/job-card";
import { JobSearchBar } from "@/components/jobs/job-search-bar";
import { LinkButton } from "@/components/ui/button";
import { SearchIcon, BookOpenIcon, TargetIcon, UserIcon, ArrowRightIcon, BriefcaseIcon } from "@/components/ui/icons";

const EXPLORE_CARDS = [
  { href: "/jobs", icon: SearchIcon, title: "Find jobs", description: "Search openings by skill, location, and work mode." },
  { href: "/learn", icon: BookOpenIcon, title: "Build skills", description: "Follow structured roadmaps toward a target role." },
  { href: "/career", icon: TargetIcon, title: "Plan your career", description: "Take a short assessment and see paths to explore." },
  { href: "/dashboard/profile", icon: UserIcon, title: "Improve your profile", description: "A complete profile improves your match scores." },
];

export default async function HomePage() {
  const [{ jobs }, learningPaths, articles] = await Promise.all([
    searchJobs({ sort: "date", page: 1 }),
    prisma.learningPath.findMany({ take: 3, include: { modules: true }, orderBy: { title: "asc" } }),
    prisma.article.findMany({ where: { publishedAt: { not: null } }, take: 3, orderBy: { publishedAt: "desc" } }),
  ]);

  const jobCards: JobCardData[] = jobs.slice(0, 6).map((job) => ({
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
    skillNames: job.skills.map((s) => s.skill.name),
  }));

  return (
    <div>
      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)] py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl text-[var(--color-text-primary)] sm:text-4xl">
            Your career, jobs, and learning — in one place.
          </h1>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            Search real openings, see why a role fits you, and close the skill gaps that get you there.
          </p>
          <div className="mt-8">
            <JobSearchBar />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="font-display text-xl text-[var(--color-text-primary)]">Explore what you can do</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EXPLORE_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 no-underline hover:shadow-[var(--shadow-md)]"
            >
              <card.icon width={22} height={22} className="text-[var(--color-accent-text)]" />
              <h3 className="mt-3 font-medium text-[var(--color-text-primary)]">{card.title}</h3>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{card.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-[var(--color-text-primary)]">Recently posted</h2>
          <LinkButton href="/jobs" variant="ghost" size="sm">
            View all jobs
          </LinkButton>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobCards.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {learningPaths.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-[var(--color-text-primary)]">Build the skills employers need</h2>
            <LinkButton href="/learn" variant="ghost" size="sm">
              All learning paths
            </LinkButton>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {learningPaths.map((path) => (
              <Link
                key={path.id}
                href={`/learn/${path.slug}`}
                className="group rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 no-underline hover:shadow-[var(--shadow-md)]"
              >
                <BookOpenIcon width={20} height={20} className="text-[var(--color-accent-text)]" />
                <h3 className="mt-3 font-medium text-[var(--color-text-primary)]">{path.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{path.modules.length} modules · ~{path.estimatedHours}h</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="border-y border-[var(--color-nav-border)] bg-[var(--color-nav-bg)] py-14">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-[var(--color-accent-highlight)]">
              <BriefcaseIcon width={18} height={18} />
              <span className="text-sm font-semibold uppercase tracking-wide">For employers</span>
            </div>
            <h2 className="mt-2 font-display text-2xl text-[var(--color-text-on-dark)]">Find and develop talent</h2>
            <p className="mt-2 text-[var(--color-text-on-dark)]/75">
              Post jobs, track applicants through a hiring pipeline, and see transparent match scores — no guesswork.
            </p>
          </div>
          <LinkButton href="/employers" variant="onDark" size="lg">
            Explore the employer platform
          </LinkButton>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
          <div className="flex items-center gap-2 text-[var(--color-accent-text)]">
            <TargetIcon width={20} height={20} />
            <span className="text-sm font-semibold uppercase tracking-wide">Career guidance</span>
          </div>
          <h2 className="mt-2 font-display text-2xl text-[var(--color-text-primary)]">Not sure what role to target?</h2>
          <p className="mt-2 max-w-xl text-base text-[var(--color-text-secondary)]">
            Take a short assessment and see a few potential career paths based on the information you provide.
          </p>
          <LinkButton href="/career" className="mt-5">
            Explore career guidance
          </LinkButton>
        </div>
      </section>

      {articles.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-[var(--color-text-primary)]">Resources</h2>
            <LinkButton href="/resources" variant="ghost" size="sm">
              All resources
            </LinkButton>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/resources/${article.slug}`}
                className="group flex flex-col rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 no-underline hover:shadow-[var(--shadow-md)]"
              >
                <h3 className="font-medium text-[var(--color-text-primary)]">{article.title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-[var(--color-text-secondary)]">{article.excerpt}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent-text)]">
                  Read more
                  <ArrowRightIcon width={14} height={14} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h2 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Ready to find your next opportunity?</h2>
        <div className="mt-6">
          <LinkButton href="/sign-up" size="lg">
            Get started
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
