import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Resources",
  description: "Practical guides on job searching, interviews, resumes, and career planning.",
};

const CATEGORY_LABEL: Record<string, string> = {
  CAREER_GUIDE: "Career guide",
  INTERVIEW_GUIDE: "Interview guide",
  RESUME_GUIDE: "Resume guide",
  INDUSTRY_INSIGHT: "Industry insight",
  SKILL_GUIDE: "Skill guide",
  EMPLOYER_INSIGHT: "Employer insight",
};

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const articles = await prisma.article.findMany({
    where: { publishedAt: { not: null }, ...(category ? { category: category as never } : {}) },
    orderBy: { publishedAt: "desc" },
  });

  const categories = Object.keys(CATEGORY_LABEL);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Resources</h1>
      <p className="mt-2 text-base text-[var(--color-text-secondary)]">Practical guides on job searching, interviews, resumes, and career planning.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/resources"
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${!category ? "bg-[var(--color-accent-decorative)] text-white" : "bg-[var(--color-surface-sunken)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"}`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/resources?category=${cat}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${category === cat ? "bg-[var(--color-accent-decorative)] text-white" : "bg-[var(--color-surface-sunken)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"}`}
          >
            {CATEGORY_LABEL[cat]}
          </Link>
        ))}
      </div>

      <ul className="mt-8 flex flex-col gap-4">
        {articles.map((article) => (
          <li key={article.id}>
            <Link href={`/resources/${article.slug}`} className="block rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 no-underline hover:shadow-[var(--shadow-md)]">
              <Badge tone="neutral">{CATEGORY_LABEL[article.category]}</Badge>
              <h2 className="mt-2 font-display text-lg text-[var(--color-text-primary)]">{article.title}</h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{article.excerpt}</p>
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">{article.readingMinutes} min read</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
