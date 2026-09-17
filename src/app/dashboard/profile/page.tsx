import type { Metadata } from "next";
import { requireRoleOrRedirect } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { BasicInfoForm } from "@/components/profile/basic-info-form";
import { EducationSection } from "@/components/profile/education-section";
import { ExperienceSection } from "@/components/profile/experience-section";
import { SkillsSection } from "@/components/profile/skills-section";
import { ResumeSection } from "@/components/profile/resume-section";
import { ProgressBar } from "@/components/ui/progress-bar";
import { computeProfileCompleteness } from "@/lib/profile/completeness";

export const metadata: Metadata = { title: "Your profile" };

export default async function ProfilePage() {
  const session = await requireRoleOrRedirect(["CANDIDATE"]);

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      educations: { orderBy: { startYear: "desc" } },
      experiences: { orderBy: { startDate: "desc" } },
      skills: { include: { skill: true }, orderBy: { skill: { name: "asc" } } },
      resumes: { orderBy: { uploadedAt: "desc" } },
    },
  });

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p>We couldn&apos;t load your profile.</p>
      </div>
    );
  }

  const completeness = computeProfileCompleteness({
    headline: profile.headline,
    summary: profile.summary,
    locationCity: profile.locationCity,
    experienceYears: profile.experienceYears,
    preferredRoles: profile.preferredRoles,
    educationCount: profile.educations.length,
    experienceCount: profile.experiences.length,
    skillCount: profile.skills.length,
    resumeCount: profile.resumes.length,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">Your profile</h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        A complete profile improves your job match scores and helps employers understand your background.
      </p>

      <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Profile completeness</span>
          <span className="text-sm font-semibold text-[var(--color-accent-text)]">{completeness.percentage}%</span>
        </div>
        <div className="mt-2">
          <ProgressBar percentage={completeness.percentage} label="Profile completeness" />
        </div>
      </div>

      <ProfileSection title="Basic information">
        <BasicInfoForm
          defaults={{
            headline: profile.headline ?? "",
            summary: profile.summary ?? "",
            locationCity: profile.locationCity ?? "",
            locationState: profile.locationState ?? "",
            experienceYears: profile.experienceYears?.toString() ?? "",
            availability: profile.availability,
            salaryExpectationMin: profile.salaryExpectationMin?.toString() ?? "",
            salaryExpectationMax: profile.salaryExpectationMax?.toString() ?? "",
            preferredRoles: profile.preferredRoles.join(", "),
            preferredWorkModes: profile.preferredWorkModes,
            preferredEmploymentTypes: profile.preferredEmploymentTypes,
          }}
        />
      </ProfileSection>

      <ProfileSection title="Education">
        <EducationSection items={profile.educations} />
      </ProfileSection>

      <ProfileSection title="Work experience">
        <ExperienceSection items={profile.experiences} />
      </ProfileSection>

      <ProfileSection title="Skills">
        <SkillsSection items={profile.skills.map((s) => ({ skillId: s.skillId, name: s.skill.name, proficiency: s.proficiency }))} />
      </ProfileSection>

      <ProfileSection title="Resume">
        <ResumeSection items={profile.resumes} />
      </ProfileSection>
    </div>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 border-t border-[var(--color-border)] pt-8">
      <h2 className="font-display text-lg text-[var(--color-text-primary)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
