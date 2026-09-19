import type { Metadata } from "next";
import { requireRoleOrRedirect } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { BasicInfoForm } from "@/components/profile/basic-info-form";
import { EducationSection } from "@/components/profile/education-section";
import { ExperienceSection } from "@/components/profile/experience-section";
import { SkillsSection } from "@/components/profile/skills-section";
import { ProjectsSection } from "@/components/profile/projects-section";
import { CertificationsSection } from "@/components/profile/certifications-section";
import { LanguagesSection } from "@/components/profile/languages-section";
import { LinksSection } from "@/components/profile/links-section";
import { VolunteeringSection } from "@/components/profile/volunteering-section";
import { PublicationsSection } from "@/components/profile/publications-section";
import { AwardsSection } from "@/components/profile/awards-section";
import { ResumeSection } from "@/components/profile/resume-section";
import { ProgressBar } from "@/components/ui/progress-bar";
import { computeProfileCompleteness } from "@/lib/profile/completeness";
import { ProfileImportProvider } from "@/components/profile/profile-import-context";
import { ImportProfileMenu } from "@/components/profile/import-profile-menu";

export const metadata: Metadata = { title: "Your profile" };

/** Pulls just the username back out of a stored full profile URL, for the username-only input. */
function usernameFromUrl(url: string | null, hosts: string[]): string {
  if (!url) return "";
  let value = url.trim();
  for (const host of hosts) {
    value = value.replace(new RegExp(`^https?://(www\\.)?${host}/(in/)?`, "i"), "");
  }
  return value.replace(/\/+$/, "");
}

export default async function ProfilePage() {
  const session = await requireRoleOrRedirect(["CANDIDATE"]);

  const [profile, skillCatalog, jobTitles, careerPathTitles] = await Promise.all([
    prisma.candidateProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        educations: { orderBy: { startYear: "desc" } },
        experiences: { orderBy: { startDate: "desc" } },
        skills: { include: { skill: true }, orderBy: { skill: { name: "asc" } } },
        projects: { orderBy: { createdAt: "desc" } },
        certifications: { orderBy: { createdAt: "desc" } },
        languages: { orderBy: { name: "asc" } },
        links: { orderBy: { createdAt: "desc" } },
        volunteering: { orderBy: { startDate: "desc" } },
        publications: { orderBy: { createdAt: "desc" } },
        awards: { orderBy: { createdAt: "desc" } },
        resumes: { orderBy: { uploadedAt: "desc" } },
      },
    }),
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
    prisma.job.findMany({ where: { status: "PUBLISHED" }, select: { title: true }, distinct: ["title"] }),
    prisma.careerPath.findMany({ select: { title: true }, distinct: ["title"] }),
  ]);

  const roleCatalog = Array.from(new Set([...jobTitles, ...careerPathTitles].map((t) => t.title)))
    .sort((a, b) => a.localeCompare(b))
    .map((title) => ({ value: title, label: title }));

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
        This structured profile is what employers and the ATS check compare against — no resume file upload required to
        apply.
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

      <ProfileImportProvider>
        <div className="mt-8">
          <ImportProfileMenu />
        </div>

        <ProfileSection title="Basic information">
          <BasicInfoForm
            defaults={{
              firstName: profile.firstName ?? "",
              lastName: profile.lastName ?? "",
              headline: profile.headline ?? "",
              summary: profile.summary ?? "",
              githubUsername: usernameFromUrl(profile.githubUrl, ["github\\.com"]),
              linkedinUsername: usernameFromUrl(profile.linkedinUrl, ["linkedin\\.com"]),
              portfolioUrl: profile.portfolioUrl ?? "",
              locationCity: profile.locationCity ?? "",
              locationState: profile.locationState ?? "",
              experienceYears: profile.experienceYears?.toString() ?? "",
              availability: profile.availability,
              salaryExpectationMin: profile.salaryExpectationMin?.toString() ?? "",
              salaryExpectationMax: profile.salaryExpectationMax?.toString() ?? "",
              preferredRoles: profile.preferredRoles,
              preferredWorkModes: profile.preferredWorkModes,
              preferredEmploymentTypes: profile.preferredEmploymentTypes,
            }}
            roleCatalog={roleCatalog}
          />
        </ProfileSection>

        <ProfileSection title="Other links" description="GitHub and LinkedIn are set above — add anything else here (portfolio pieces, LeetCode, Behance, etc.).">
          <LinksSection items={profile.links} />
        </ProfileSection>

        <ProfileSection title="Education" description="10th, 12th, and undergraduate are required — add postgraduate, diplomas, or certificate programs below if you have them.">
          <EducationSection items={profile.educations} />
        </ProfileSection>

        <ProfileSection title="Skills">
          <SkillsSection
            items={profile.skills.map((s) => ({ skillId: s.skillId, name: s.skill.name }))}
            catalog={skillCatalog.map((s) => ({ value: s.name, label: s.name }))}
          />
        </ProfileSection>

        <ProfileSection title="Work experience & internships" description="Use the type field to mark internships separately from full-time roles.">
          <ExperienceSection items={profile.experiences} />
        </ProfileSection>

        <ProfileSection title="Projects">
          <ProjectsSection items={profile.projects} />
        </ProfileSection>

        <ProfileSection title="Certifications">
          <CertificationsSection items={profile.certifications} />
        </ProfileSection>

        <ProfileSection title="Volunteering">
          <VolunteeringSection items={profile.volunteering} />
        </ProfileSection>

        <ProfileSection title="Research papers & publications">
          <PublicationsSection items={profile.publications} />
        </ProfileSection>

        <ProfileSection title="Awards & achievements">
          <AwardsSection items={profile.awards} />
        </ProfileSection>

        <ProfileSection title="Languages">
          <LanguagesSection items={profile.languages} />
        </ProfileSection>

        <ProfileSection title="Resume file (optional)" description="Only needed if an employer specifically asks for an attached file — Easy Apply uses your structured profile above, not this file.">
          <ResumeSection items={profile.resumes} />
        </ProfileSection>
      </ProfileImportProvider>
    </div>
  );
}

function ProfileSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 border-t border-[var(--color-border)] pt-8">
      <h2 className="font-display text-lg text-[var(--color-text-primary)]">{title}</h2>
      {description && <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
