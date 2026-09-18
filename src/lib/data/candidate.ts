import { prisma } from "@/lib/prisma";
import type { CandidateForMatching } from "@/lib/matching/job-match";
import type { AtsProfileText } from "@/lib/matching/ats-score";
import type { ProfileSectionKey } from "@/lib/profile/sections";

export async function getCandidateMatchContext(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      skills: { include: { skill: true } },
      educations: { take: 1 },
    },
  });
  if (!profile) return null;

  const forMatching: CandidateForMatching = {
    skillNames: profile.skills.map((s) => s.skill.name),
    experienceYears: profile.experienceYears ? Number(profile.experienceYears) : null,
    locationCity: profile.locationCity,
    preferredWorkModes: profile.preferredWorkModes,
    hasEducationRecord: profile.educations.length > 0,
  };

  return { profileId: profile.id, forMatching };
}

export async function getSavedJobIdSet(profileId: string) {
  const saved = await prisma.savedJob.findMany({ where: { candidateProfileId: profileId }, select: { jobId: true } });
  return new Set(saved.map((s) => s.jobId));
}

const FULL_PROFILE_INCLUDE = {
  skills: { include: { skill: true } },
  educations: true,
  experiences: true,
  projects: true,
  certifications: true,
  languages: true,
  links: true,
  volunteering: true,
  publications: true,
  awards: true,
} as const;

export type FullCandidateProfile = NonNullable<
  Awaited<ReturnType<typeof getFullCandidateProfile>>
>;

export async function getFullCandidateProfile(userId: string) {
  return prisma.candidateProfile.findUnique({
    where: { userId },
    include: FULL_PROFILE_INCLUDE,
  });
}

/**
 * Builds the section→text map used for ATS scoring, restricted to
 * `allowedSections` only — sections not in that list are simply absent from
 * the returned object, so nothing outside what was requested/shared is ever
 * read into the score.
 */
export function buildAtsSectionText(
  profile: FullCandidateProfile,
  allowedSections: ProfileSectionKey[]
): AtsProfileText {
  const allowed = new Set(allowedSections);
  const text: AtsProfileText = {};

  if (allowed.has("BASIC_INFO")) {
    text.BASIC_INFO = [profile.headline, profile.summary].filter(Boolean).join(" ");
  }
  if (allowed.has("LINKS")) {
    text.LINKS = [profile.githubUrl, profile.linkedinUrl, profile.portfolioUrl, ...profile.links.map((l) => l.label)]
      .filter(Boolean)
      .join(" ");
  }
  if (allowed.has("EDUCATION")) {
    text.EDUCATION = profile.educations.map((e) => [e.degree, e.fieldOfStudy, e.institutionName].filter(Boolean).join(" ")).join(" ");
  }
  if (allowed.has("SKILLS")) {
    text.SKILLS = profile.skills.map((s) => s.skill.name).join(" ");
  }
  if (allowed.has("EXPERIENCE")) {
    text.EXPERIENCE = profile.experiences
      .filter((e) => e.employmentType !== "INTERNSHIP")
      .map((e) => [e.title, e.company, e.description].filter(Boolean).join(" "))
      .join(" ");
  }
  if (allowed.has("INTERNSHIPS")) {
    text.INTERNSHIPS = profile.experiences
      .filter((e) => e.employmentType === "INTERNSHIP")
      .map((e) => [e.title, e.company, e.description].filter(Boolean).join(" "))
      .join(" ");
  }
  if (allowed.has("PROJECTS")) {
    text.PROJECTS = profile.projects.map((p) => [p.title, p.description, p.skillsUsed.join(" ")].filter(Boolean).join(" ")).join(" ");
  }
  if (allowed.has("CERTIFICATIONS")) {
    text.CERTIFICATIONS = profile.certifications.map((c) => [c.name, c.issuer].filter(Boolean).join(" ")).join(" ");
  }
  if (allowed.has("VOLUNTEERING")) {
    text.VOLUNTEERING = profile.volunteering.map((v) => [v.role, v.organization, v.cause, v.description].filter(Boolean).join(" ")).join(" ");
  }
  if (allowed.has("PUBLICATIONS")) {
    text.PUBLICATIONS = profile.publications.map((p) => [p.title, p.venue, p.description].filter(Boolean).join(" ")).join(" ");
  }
  if (allowed.has("AWARDS")) {
    text.AWARDS = profile.awards.map((a) => [a.title, a.issuer, a.description].filter(Boolean).join(" ")).join(" ");
  }
  if (allowed.has("LANGUAGES")) {
    text.LANGUAGES = profile.languages.map((l) => l.name).join(" ");
  }

  return text;
}
