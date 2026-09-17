import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEmployerMembership } from "@/lib/auth/employer";
import { prisma } from "@/lib/prisma";
import { updateJobAction, setJobStatusAction } from "@/lib/actions/employer-jobs";
import { JobForm } from "@/components/employer/job-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Edit job" };

export default async function EmployerJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { membership } = await requireEmployerMembership();

  const job = await prisma.job.findFirst({
    where: { id, companyId: membership.companyId },
    include: { skills: { include: { skill: true } }, _count: { select: { applications: true } } },
  });
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">{job.title}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge tone={job.status === "PUBLISHED" ? "success" : job.status === "CLOSED" ? "warning" : "neutral"}>{job.status}</Badge>
            <span className="text-sm text-[var(--color-text-secondary)]">{job._count.applications} applicants</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/employer/jobs/${job.id}/applicants`} className="inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-3.5 py-2 text-sm font-medium hover:bg-[var(--color-surface-sunken)]">
            View applicants
          </Link>
          {job.status === "PUBLISHED" ? (
            <form action={setJobStatusAction.bind(null, job.id, "CLOSED")}>
              <Button type="submit" variant="secondary" size="sm">
                Close job
              </Button>
            </form>
          ) : job.status === "DRAFT" ? (
            <form action={setJobStatusAction.bind(null, job.id, "PUBLISHED")}>
              <Button type="submit" size="sm">
                Publish
              </Button>
            </form>
          ) : (
            <form action={setJobStatusAction.bind(null, job.id, "PUBLISHED")}>
              <Button type="submit" size="sm">
                Reopen
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-6">
        <JobForm
          mode="edit"
          onSubmitUpdate={updateJobAction.bind(null, job.id)}
          defaults={{
            title: job.title,
            description: job.description,
            responsibilities: job.responsibilities ?? "",
            requirements: job.requirements ?? "",
            department: job.department ?? "",
            employmentType: job.employmentType,
            workMode: job.workMode,
            experienceMinYears: job.experienceMinYears?.toString() ?? "",
            experienceMaxYears: job.experienceMaxYears?.toString() ?? "",
            educationRequirement: job.educationRequirement ?? "",
            salaryMin: job.salaryMin?.toString() ?? "",
            salaryMax: job.salaryMax?.toString() ?? "",
            isSalaryDisclosed: job.isSalaryDisclosed,
            locationCity: job.locationCity ?? "",
            isFresherFriendly: job.isFresherFriendly,
            applicationMethod: job.applicationMethod,
            externalApplyUrl: job.externalApplyUrl ?? "",
            applicationDeadline: job.applicationDeadline ? job.applicationDeadline.toISOString().slice(0, 10) : "",
            skills: job.skills.map((s) => s.skill.name).join(", "),
          }}
        />
      </div>
    </div>
  );
}
