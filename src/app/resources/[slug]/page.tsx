import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

const CATEGORY_LABEL: Record<string, string> = {
  CAREER_GUIDE: "Career guide",
  INTERVIEW_GUIDE: "Interview guide",
  RESUME_GUIDE: "Resume guide",
  INDUSTRY_INSIGHT: "Industry insight",
  SKILL_GUIDE: "Skill guide",
  EMPLOYER_INSIGHT: "Employer insight",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) return {};
  return { title: article.title, description: article.excerpt };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article || !article.publishedAt) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Organization", name: article.authorName },
  };

  return (
    <article className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-text-muted)]">
        <Link href="/resources" className="hover:underline">
          Resources
        </Link>
      </nav>

      <Badge tone="neutral" className="mt-3">
        {CATEGORY_LABEL[article.category]}
      </Badge>
      <h1 className="mt-2 font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">{article.title}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        {article.authorName} · {article.readingMinutes} min read ·{" "}
        {article.publishedAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="mt-6 whitespace-pre-line text-base leading-relaxed text-[var(--color-text-secondary)]">{article.body}</div>
    </article>
  );
}
