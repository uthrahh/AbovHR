import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { enrollLearningPathAction, toggleModuleCompleteAction } from "@/lib/actions/learning";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const RESOURCE_TYPE_LABEL: Record<string, string> = {
  ARTICLE: "Article",
  VIDEO: "Video",
  PRACTICE: "Practice",
  PROJECT: "Project",
  QUIZ: "Quiz",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = await prisma.learningPath.findUnique({ where: { slug } });
  if (!path) return {};
  return { title: path.title, description: path.description };
}

export default async function LearningPathDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = await prisma.learningPath.findUnique({
    where: { slug },
    include: { modules: { orderBy: { order: "asc" }, include: { skill: true } }, careerPath: true },
  });
  if (!path) notFound();

  const session = await auth();
  const userPath = session?.user
    ? await prisma.userLearningPath.findUnique({
        where: { userId_learningPathId: { userId: session.user.id, learningPathId: path.id } },
        include: { moduleProgress: true },
      })
    : null;

  const completedModuleIds = new Set((userPath?.moduleProgress ?? []).filter((m) => m.status === "COMPLETED").map((m) => m.learningModuleId));
  const percentage = path.modules.length > 0 ? Math.round((completedModuleIds.size / path.modules.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">{path.title}</h1>
      <p className="mt-2 text-base text-[var(--color-text-secondary)]">{path.description}</p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        {path.modules.length} modules · ~{path.estimatedHours} hours
        {path.careerPath && <> · part of the {path.careerPath.title} path</>}
      </p>

      {userPath ? (
        <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Your progress</span>
            <span className="text-sm font-semibold text-[var(--color-accent-text)]">{percentage}%</span>
          </div>
          <div className="mt-2">
            <ProgressBar percentage={percentage} label={`${path.title} progress`} />
          </div>
        </div>
      ) : (
        <form action={enrollLearningPathAction.bind(null, path.id, path.slug)} className="mt-5">
          <Button type="submit" size="lg">
            Start learning
          </Button>
        </form>
      )}

      <ol className="mt-8 flex flex-col gap-3">
        {path.modules.map((module, index) => {
          const isComplete = completedModuleIds.has(module.id);
          return (
            <li
              key={module.id}
              className={cn(
                "flex items-start gap-4 rounded-[var(--radius-md)] border p-4",
                isComplete ? "border-[var(--color-success)] bg-[var(--color-success-subtle)]" : "border-[var(--color-border)] bg-[var(--color-surface)]"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isComplete ? "bg-[var(--color-success)] text-white" : "bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)]"
                )}
                aria-hidden="true"
              >
                {isComplete ? <CheckIcon width={13} height={13} /> : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{module.title}</p>
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  {RESOURCE_TYPE_LABEL[module.resourceType]} · ~{module.estimatedHours}h{module.skill ? ` · ${module.skill.name}` : ""}
                </p>
              </div>
              {userPath && (
                <form action={toggleModuleCompleteAction.bind(null, userPath.id, module.id, path.slug)}>
                  <button
                    type="submit"
                    className={cn(
                      "shrink-0 rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-medium",
                      isComplete
                        ? "border-transparent text-[var(--color-success)] hover:underline"
                        : "border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)]"
                    )}
                  >
                    {isComplete ? "Completed" : "Mark complete"}
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
