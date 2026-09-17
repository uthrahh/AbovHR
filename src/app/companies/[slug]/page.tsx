import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { JobCard, type JobCardData } from "@/components/jobs/job-card";
import { Badge } from "@/components/ui/badge";
import { BuildingIcon, MapPinIcon, ExternalLinkIcon } from "@/components/ui/icons";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) return {};
  return { title: company.name, description: company.about ?? `Open positions at ${company.name} on Abov.` };
}

export default async function CompanyProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = await prisma.company.findUnique({ where: { slug, deletedAt: null } });
  if (!company) notFound();

  const session = await auth();
  const jobsRaw = await prisma.job.findMany({
    where: { companyId: company.id, status: "PUBLISHED" },
    include: { company: true, skills: { include: { skill: true } } },
    orderBy: { publishedAt: "desc" },
  });

  const jobs: JobCardData[] = jobsRaw.map((job) => ({
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    description: company.about ?? undefined,
    url: company.websiteUrl ?? undefined,
    industry: company.industry ?? undefined,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)]">
          <BuildingIcon width={26} height={26} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">{company.name}</h1>
            {company.verificationStatus === "VERIFIED" && <Badge tone="success">Verified employer</Badge>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]">
            {company.industry && <span>{company.industry}</span>}
            {company.headquartersCity && (
              <span className="inline-flex items-center gap-1">
                <MapPinIcon width={14} height={14} /> {company.headquartersCity}
              </span>
            )}
            {company.sizeRange && <span>{company.sizeRange} employees</span>}
            {company.websiteUrl && (
              <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--color-accent-text)] underline">
                Website <ExternalLinkIcon width={13} height={13} />
              </a>
            )}
          </div>
        </div>
      </div>

      {company.about && <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)]">{company.about}</p>}

      <section className="mt-10">
        <h2 className="font-display text-lg text-[var(--color-text-primary)]">
          Open positions {jobs.length > 0 && `(${jobs.length})`}
        </h2>
        {jobs.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">No open positions right now. Check back soon.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} isAuthenticated={!!session?.user} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
