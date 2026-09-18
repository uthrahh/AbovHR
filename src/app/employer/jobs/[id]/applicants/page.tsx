import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEmployerMembership } from "@/lib/auth/employer";
import { prisma } from "@/lib/prisma";
import { computeJobMatch } from "@/lib/matching/job-match";
import { addApplicationNoteAction } from "@/lib/actions/employer-applications";
import { StatusSelect } from "@/components/employer/status-select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { UserIcon, TargetIcon } from "@/components/ui/icons";
import { cn, formatRelativeDate } from "@/lib/utils";
import { PROFILE_SECTION_LABELS, sanitizeSections, type ProfileSectionKey } from "@/lib/profile/sections";

export const metadata: Metadata = { title: "Applicants" };

const STAGE_TABS = [
  { value: "", label: "All" },
  { value: "APPLIED", label: "Applied" },
  { value: "SCREENING", label: "Screening" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "ASSESSMENT", label: "Assessment" },
  { value: "OFFER", label: "Offer" },
  { value: "HIRED", label: "Hired" },
  { value: "REJECTED", label: "Rejected" },
];

export default async function ApplicantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ stage?: string }>;
}) {
  const { id } = await params;
  const { stage } = await searchParams;
  const { membership } = await requireEmployerMembership();

  const job = await prisma.job.findFirst({
    where: { id, companyId: membership.companyId },
    include: { skills: { include: { skill: true } } },
  });
  if (!job) notFound();

  const applications = await prisma.application.findMany({
    where: { jobId: job.id, ...(stage ? { status: stage as never } : {}) },
    orderBy: { appliedAt: "desc" },
    include: {
      candidateProfile: {
        include: {
          user: true,
          skills: { include: { skill: true } },
          educations: { orderBy: { startYear: "desc" } },
          resumes: { where: { isPrimary: true }, take: 1 },
        },
      },
      notes: { include: { author: true }, orderBy: { createdAt: "desc" } },
    },
  });

  const allApplications = stage
    ? await prisma.application.findMany({ where: { jobId: job.id }, select: { status: true } })
    : applications.map((a) => ({ status: a.status }));

  const stageCounts = allApplications.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  const requiredSkillNames = job.skills.map((s) => s.skill.name);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/employer/jobs/${job.id}`} className="text-sm text-[var(--color-text-muted)] hover:underline">
        ← {job.title}
      </Link>
      <h1 className="mt-1 font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Applicants</h1>

      <div className="mt-4 flex flex-wrap gap-1.5 border-b border-[var(--color-border)] pb-3">
        {STAGE_TABS.map((tab) => {
          const count = tab.value ? stageCounts[tab.value] ?? 0 : Object.values(stageCounts).reduce((a, b) => a + b, 0);
          const active = (stage ?? "") === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.value ? `/employer/jobs/${job.id}/applicants?stage=${tab.value}` : `/employer/jobs/${job.id}/applicants`}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium",
                active ? "bg-[var(--color-accent-decorative)] text-white" : "bg-[var(--color-surface-sunken)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
              )}
            >
              {tab.label} {tab.value ? `(${count})` : `(${count})`}
            </Link>
          );
        })}
      </div>

      {applications.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={<UserIcon width={28} height={28} />} title="No applicants in this stage" description="Applicants will appear here as they apply or move through your pipeline." />
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {applications.map((app) => {
            const candidateSkillNames = app.candidateProfile.skills.map((s) => s.skill.name);
            const match = computeJobMatch(
              {
                skillNames: candidateSkillNames,
                experienceYears: app.candidateProfile.experienceYears ? Number(app.candidateProfile.experienceYears) : null,
                locationCity: app.candidateProfile.locationCity,
                preferredWorkModes: app.candidateProfile.preferredWorkModes,
                hasEducationRecord: app.candidateProfile.educations.length > 0,
              },
              {
                requiredSkillNames,
                experienceMinYears: job.experienceMinYears,
                experienceMaxYears: job.experienceMaxYears,
                locationCity: job.locationCity,
                workMode: job.workMode,
                educationRequirement: job.educationRequirement,
              }
            );

            const sharedSections = sanitizeSections(app.sharedSections);
            const shares = (key: ProfileSectionKey) => sharedSections.includes(key);

            return (
              <li key={app.id} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--color-text-primary)]">{app.candidateProfile.user.name}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{app.candidateProfile.headline || app.candidateProfile.user.email}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">Applied {formatRelativeDate(app.appliedAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-base font-semibold text-[var(--color-accent-text)]">{match.percentage}%</div>
                      <div className="text-[0.6875rem] text-[var(--color-text-muted)]">match</div>
                    </div>
                    {app.atsScore !== null && (
                      <div className="text-right" title="ATS keyword score computed at the time this candidate applied">
                        <div className="flex items-center gap-1 text-base font-semibold text-[var(--color-text-primary)]">
                          <TargetIcon width={14} height={14} className="text-[var(--color-text-muted)]" />
                          {app.atsScore}%
                        </div>
                        <div className="text-[0.6875rem] text-[var(--color-text-muted)]">ATS</div>
                      </div>
                    )}
                    <StatusSelect applicationId={app.id} currentStatus={app.status} />
                  </div>
                </div>

                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                  Shared for this application: {sharedSections.map((s) => PROFILE_SECTION_LABELS[s]).join(", ")}
                </p>

                {shares("SKILLS") && candidateSkillNames.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {candidateSkillNames.slice(0, 6).map((skill) => (
                      <Badge key={skill} tone={requiredSkillNames.includes(skill) ? "accent" : "neutral"}>
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}

                {shares("EDUCATION") && app.candidateProfile.educations[0] && (
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    {app.candidateProfile.educations[0].degree}
                    {app.candidateProfile.educations[0].fieldOfStudy ? `, ${app.candidateProfile.educations[0].fieldOfStudy}` : ""} —{" "}
                    {app.candidateProfile.educations[0].institutionName}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-4">
                  {app.candidateProfile.resumes[0] ? (
                    <a href={`/api/resumes/${app.candidateProfile.resumes[0].id}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--color-accent-text)] underline">
                      View resume file
                    </a>
                  ) : (
                    <span className="text-sm text-[var(--color-text-muted)]">No resume file attached</span>
                  )}
                </div>

                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-[var(--color-text-secondary)]">
                    Notes ({app.notes.length})
                  </summary>
                  <div className="mt-2 flex flex-col gap-2">
                    {app.notes.map((note) => (
                      <p key={note.id} className="rounded-[var(--radius-sm)] bg-[var(--color-surface-sunken)] p-2.5 text-sm text-[var(--color-text-secondary)]">
                        <span className="font-medium text-[var(--color-text-primary)]">{note.author.name}: </span>
                        {note.note}
                      </p>
                    ))}
                    <form action={addApplicationNoteAction.bind(null, app.id)} className="flex gap-2">
                      <label htmlFor={`note-${app.id}`} className="sr-only">
                        Add a note
                      </label>
                      <input
                        id={`note-${app.id}`}
                        name="note"
                        type="text"
                        placeholder="Add an internal note…"
                        className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
                      />
                      <button type="submit" className="rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--color-surface-sunken)]">
                        Add
                      </button>
                    </form>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
