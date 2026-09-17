import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { setJobModerationStatusAction } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Admin — jobs" };

export default async function AdminJobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { company: true, _count: { select: { applications: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Jobs</h1>
      <ul className="mt-6 flex flex-col gap-2">
        {jobs.map((job) => (
          <li key={job.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div>
              <Link href={`/jobs/${job.slug}`} className="font-medium text-[var(--color-text-primary)] hover:underline">
                {job.title}
              </Link>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {job.company.name} · {job._count.applications} applicants
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={job.status === "PUBLISHED" ? "success" : job.status === "ARCHIVED" ? "error" : "neutral"}>{job.status}</Badge>
              {job.status !== "ARCHIVED" ? (
                <form action={setJobModerationStatusAction.bind(null, job.id, "ARCHIVED")}>
                  <button type="submit" className="text-sm font-medium text-[var(--color-error)] underline">
                    Remove listing
                  </button>
                </form>
              ) : (
                <form action={setJobModerationStatusAction.bind(null, job.id, "PUBLISHED")}>
                  <button type="submit" className="text-sm font-medium text-[var(--color-accent-text)] underline">
                    Restore
                  </button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
