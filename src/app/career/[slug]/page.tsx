import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { JobCard, type JobCardData } from "@/components/jobs/job-card";
import { LinkButton } from "@/components/ui/button";
import { CheckIcon, AlertIcon, BookOpenIcon } from "@/components/ui/icons";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = await prisma.careerPath.findUnique({ where: { slug } });
  if (!path) return {};
  return { title: path.title, description: path.description };
}

export default async function CareerPathDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = await prisma.careerPath.findUnique({
    where: { slug },
    include: {
      requiredSkills: { include: { skill: true }, orderBy: { importance: "asc" } },
      learningPaths: true,
    },
  });
  if (!path) notFound();

  const session = await auth();
  let candidateSkillNames = new Set<string>();
  if (session?.user?.role === "CANDIDATE") {
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: session.user.id },
      include: { skills: { include: { skill: true } } },
    });
    if (profile) candidateSkillNames = new Set(profile.skills.map((s) => s.skill.name.toLowerCase()));
  }

  const haveSkills = path.requiredSkills.filter((s) => candidateSkillNames.has(s.skill.name.toLowerCase()));
  const gapSkills = path.requiredSkills.filter((s) => !candidateSkillNames.has(s.skill.name.toLowerCase()));

  const relatedJobsRaw = await prisma.job.findMany({
    where: { status: "PUBLISHED", skills: { some: { skillId: { in: path.requiredSkills.map((s) => s.skillId) } } } },
    include: { company: true, skills: { include: { skill: true } } },
    take: 4,
    orderBy: { publishedAt: "desc" },
  });
  const relatedJobs: JobCardData[] = relatedJobsRaw.map((job) => ({
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

  const learningPath = path.learningPaths[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm text-[var(--color-text-muted)]">{path.category}</p>
      <h1 className="mt-1 font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">{path.title}</h1>
      <p className="mt-3 max-w-2xl text-base text-[var(--color-text-secondary)]">{path.description}</p>

      {session?.user?.role === "CANDIDATE" ? (
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-success-subtle)] p-5">
            <div className="flex items-center gap-2 text-[var(--color-success)]">
              <CheckIcon width={18} height={18} />
              <h2 className="text-sm font-semibold">You already have</h2>
            </div>
            {haveSkills.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">None of the listed skills are on your profile yet.</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {haveSkills.map((s) => (
                  <li key={s.id} className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-[var(--color-success)]">
                    {s.skill.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-warning-subtle)] p-5">
            <div className="flex items-center gap-2 text-[var(--color-warning)]">
              <AlertIcon width={18} height={18} />
              <h2 className="text-sm font-semibold">You may need</h2>
            </div>
            {gapSkills.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">You have every listed skill for this path.</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {gapSkills.map((s) => (
                  <li key={s.id} className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-[var(--color-warning)]">
                    {s.skill.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ) : (
        <div className="mt-8 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] p-5 text-sm text-[var(--color-text-secondary)]">
          <Link href={`/sign-in?next=${encodeURIComponent(`/career/${slug}`)}`} className="font-medium text-[var(--color-accent-text)] underline">
            Sign in
          </Link>{" "}
          to see a skill gap analysis compared to your own profile.
        </div>
      )}

      <section className="mt-8">
        <h2 className="font-display text-lg text-[var(--color-text-primary)]">All relevant skills</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {path.requiredSkills.map((s) => (
            <span key={s.id} className="rounded-full bg-[var(--color-surface-sunken)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
              {s.skill.name} <span className="text-[var(--color-text-muted)]">· {s.importance === "CORE" ? "core" : s.importance === "RECOMMENDED" ? "recommended" : "nice to have"}</span>
            </span>
          ))}
        </div>
      </section>

      {learningPath && (
        <section className="mt-8 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center gap-2 text-[var(--color-accent-text)]">
            <BookOpenIcon width={18} height={18} />
            <h2 className="text-sm font-semibold">Suggested learning roadmap</h2>
          </div>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {learningPath.title} — about {learningPath.estimatedHours} hours
          </p>
          <LinkButton href={`/learn/${learningPath.slug}`} size="sm" className="mt-3">
            View roadmap
          </LinkButton>
        </section>
      )}

      {relatedJobs.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg text-[var(--color-text-primary)]">Related jobs</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {relatedJobs.map((job) => (
              <JobCard key={job.id} job={job} isAuthenticated={!!session?.user} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
