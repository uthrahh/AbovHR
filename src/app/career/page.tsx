import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui/button";
import { TargetIcon, ArrowRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Career guidance",
  description: "Explore career paths and take a short assessment to see roles that may fit your interests and preferences.",
};

export default async function CareerHubPage() {
  const careerPaths = await prisma.careerPath.findMany({ orderBy: { title: "asc" } });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <div className="flex items-center gap-2 text-[var(--color-accent-text)]">
          <TargetIcon width={20} height={20} />
          <span className="text-sm font-semibold uppercase tracking-wide">Career guidance</span>
        </div>
        <h1 className="mt-3 font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">
          Not sure what role to target next?
        </h1>
        <p className="mt-2 max-w-2xl text-base text-[var(--color-text-secondary)]">
          Take a short assessment covering your interests and work preferences. We&apos;ll suggest a few career paths to
          explore based on the information you provide — not a guarantee, just a starting point.
        </p>
        <div className="mt-5">
          <LinkButton href="/career/assessment">Take the assessment</LinkButton>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl text-[var(--color-text-primary)]">Browse career paths</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {careerPaths.map((path) => (
            <Link
              key={path.id}
              href={`/career/${path.slug}`}
              className="group rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 no-underline hover:shadow-[var(--shadow-md)]"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-[var(--color-text-primary)]">{path.title}</h3>
                <ArrowRightIcon width={16} height={16} className="text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">{path.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
