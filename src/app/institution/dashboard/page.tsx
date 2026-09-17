import type { Metadata } from "next";
import { requireInstitutionMembership } from "@/lib/auth/institution";
import { prisma } from "@/lib/prisma";
import { StatTile } from "@/components/dashboard/stat-tile";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { GraduationCapIcon, BriefcaseIcon, ChartIcon } from "@/components/ui/icons";
import { computeProfileCompleteness } from "@/lib/profile/completeness";

export const metadata: Metadata = { title: "Institution dashboard" };

export default async function InstitutionDashboardPage() {
  const { membership } = await requireInstitutionMembership();

  const cohorts = await prisma.cohort.findMany({
    where: { institutionId: membership.institutionId },
    include: {
      students: {
        include: {
          candidateProfile: {
            include: {
              user: true,
              skills: true,
              educations: true,
              experiences: true,
              resumes: true,
              applications: { where: { status: { not: "WITHDRAWN" } } },
            },
          },
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  const totalStudents = cohorts.reduce((sum, c) => sum + c.students.length, 0);
  const totalApplications = cohorts.reduce(
    (sum, c) => sum + c.students.reduce((s, st) => s + st.candidateProfile.applications.length, 0),
    0
  );
  const avgCompleteness =
    totalStudents === 0
      ? 0
      : Math.round(
          cohorts.reduce(
            (sum, c) =>
              sum +
              c.students.reduce((s, st) => {
                const completeness = computeProfileCompleteness({
                  headline: st.candidateProfile.headline,
                  summary: st.candidateProfile.summary,
                  locationCity: st.candidateProfile.locationCity,
                  experienceYears: st.candidateProfile.experienceYears,
                  preferredRoles: st.candidateProfile.preferredRoles,
                  educationCount: st.candidateProfile.educations.length,
                  experienceCount: st.candidateProfile.experiences.length,
                  skillCount: st.candidateProfile.skills.length,
                  resumeCount: st.candidateProfile.resumes.length,
                });
                return s + completeness.percentage;
              }, 0),
            0
          ) / totalStudents
        );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">{membership.institution.name}</h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Student career readiness across your cohorts.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Cohorts" value={cohorts.length} icon={<GraduationCapIcon width={16} height={16} />} />
        <StatTile label="Students" value={totalStudents} icon={<GraduationCapIcon width={16} height={16} />} />
        <StatTile label="Applications sent" value={totalApplications} icon={<BriefcaseIcon width={16} height={16} />} />
      </div>

      {cohorts.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<GraduationCapIcon width={28} height={28} />}
            title="No cohorts yet"
            description="Cohorts and student enrollment are currently set up by the Abov team during institution onboarding."
          />
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          {cohorts.map((cohort) => (
            <section key={cohort.id} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg text-[var(--color-text-primary)]">{cohort.name}</h2>
                <span className="text-sm text-[var(--color-text-muted)]">{cohort.students.length} students</span>
              </div>

              <ul className="mt-4 flex flex-col gap-2">
                {cohort.students.map((student) => {
                  const completeness = computeProfileCompleteness({
                    headline: student.candidateProfile.headline,
                    summary: student.candidateProfile.summary,
                    locationCity: student.candidateProfile.locationCity,
                    experienceYears: student.candidateProfile.experienceYears,
                    preferredRoles: student.candidateProfile.preferredRoles,
                    educationCount: student.candidateProfile.educations.length,
                    experienceCount: student.candidateProfile.experiences.length,
                    skillCount: student.candidateProfile.skills.length,
                    resumeCount: student.candidateProfile.resumes.length,
                  });
                  return (
                    <li key={student.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{student.candidateProfile.user.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {student.candidateProfile.applications.length} application{student.candidateProfile.applications.length === 1 ? "" : "s"} · {student.candidateProfile.skills.length} skills listed
                        </p>
                      </div>
                      <div className="w-32">
                        <ProgressBar percentage={completeness.percentage} label={`${student.candidateProfile.user.name} profile completeness`} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-4 text-sm text-[var(--color-text-secondary)]">
            <ChartIcon width={16} height={16} className="mb-1 inline text-[var(--color-accent-text)]" /> Average profile
            completeness across your students: <strong>{avgCompleteness}%</strong>.
          </div>
        </div>
      )}
    </div>
  );
}
