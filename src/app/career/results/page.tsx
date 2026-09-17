import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Your career suggestions" };

type SuggestionSummary = { suggestions: { pathId: string; slug: string; title: string; rank: number; reason: string }[] };

export default async function CareerResultsPage() {
  const session = await requireSession();

  const result = await prisma.assessmentResult.findFirst({
    where: { userId: session.user.id, assessment: { type: "CAREER" } },
    orderBy: { completedAt: "desc" },
  });

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          title="No assessment results yet"
          description="Take the career assessment to get a few suggested paths to explore."
          action={<LinkButton href="/career/assessment">Take the assessment</LinkButton>}
        />
      </div>
    );
  }

  const summary = result.summary as unknown as SuggestionSummary;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Potential career paths for you</h1>
      <p className="mt-2 text-base text-[var(--color-text-secondary)]">
        Based on the information you provided in your assessment on {result.completedAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.
        These are starting points to explore, not a prediction or a guarantee.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {summary.suggestions.map((s) => (
          <Link
            key={s.pathId}
            href={`/career/${s.slug}`}
            className="group flex items-start justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 no-underline hover:shadow-[var(--shadow-md)]"
          >
            <div>
              <h2 className="font-medium text-[var(--color-text-primary)]">{s.title}</h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{s.reason}</p>
            </div>
            <ArrowRightIcon width={18} height={18} className="mt-1 shrink-0 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      <LinkButton href="/career/assessment" variant="ghost" size="sm" className="mt-6">
        Retake the assessment
      </LinkButton>
    </div>
  );
}
