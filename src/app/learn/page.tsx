import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProgressBar } from "@/components/ui/progress-bar";
import { BookOpenIcon, ArrowRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Learning paths",
  description: "Structured learning roadmaps to build the skills employers are looking for.",
};

export default async function LearnHubPage() {
  const session = await auth();

  const [paths, userPaths] = await Promise.all([
    prisma.learningPath.findMany({ include: { modules: true, careerPath: true }, orderBy: { title: "asc" } }),
    session?.user
      ? prisma.userLearningPath.findMany({ where: { userId: session.user.id }, include: { moduleProgress: true } })
      : Promise.resolve([]),
  ]);

  const progressByPathId = new Map(userPaths.map((up) => [up.learningPathId, up]));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Build the skills employers need</h1>
      <p className="mt-2 max-w-2xl text-base text-[var(--color-text-secondary)]">
        Each roadmap breaks a career goal into ordered modules — articles, practice sets, and projects — so you always know
        the next step.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {paths.map((path) => {
          const userPath = progressByPathId.get(path.id);
          const completed = userPath?.moduleProgress.filter((m) => m.status === "COMPLETED").length ?? 0;
          const percentage = path.modules.length > 0 ? Math.round((completed / path.modules.length) * 100) : 0;

          return (
            <Link
              key={path.id}
              href={`/learn/${path.slug}`}
              className="group flex flex-col rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 no-underline hover:shadow-[var(--shadow-md)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-[var(--color-accent-text)]">
                  <BookOpenIcon width={18} height={18} />
                </div>
                <ArrowRightIcon width={16} height={16} className="text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5" />
              </div>
              <h2 className="mt-2 font-medium text-[var(--color-text-primary)]">{path.title}</h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{path.description}</p>
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                {path.modules.length} modules · ~{path.estimatedHours} hours
              </p>
              {userPath && (
                <div className="mt-3">
                  <ProgressBar percentage={percentage} label={`${path.title} progress`} />
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">{percentage}% complete</p>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
