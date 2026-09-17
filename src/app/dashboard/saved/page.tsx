import type { Metadata } from "next";
import { requireRoleOrRedirect } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { JobCard, type JobCardData } from "@/components/jobs/job-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { BookmarkIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Saved jobs" };

export default async function SavedJobsPage() {
  const session = await requireRoleOrRedirect(["CANDIDATE"]);

  const profile = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } });
  const saved = profile
    ? await prisma.savedJob.findMany({
        where: { candidateProfileId: profile.id },
        include: { job: { include: { company: true, skills: { include: { skill: true } } } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const cards: JobCardData[] = saved.map(({ job }) => ({
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Saved jobs</h1>

      {cards.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<BookmarkIcon width={28} height={28} />}
            title="No saved jobs yet"
            description="Save jobs you're considering so you can find them again easily."
            action={<LinkButton href="/jobs">Explore jobs</LinkButton>}
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {cards.map((job) => (
            <JobCard key={job.id} job={job} isSaved isAuthenticated />
          ))}
        </div>
      )}
    </div>
  );
}
