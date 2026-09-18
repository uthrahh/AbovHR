/**
 * Canonical list of candidate-profile "sections" that an employer can
 * request for a job, and a candidate shares when applying. Used by:
 *  - the job-posting form (Job.requestedSections)
 *  - the apply flow (Application.sharedSections snapshot)
 *  - the ATS scorer (src/lib/matching/ats-score.ts)
 *  - the employer applicant view (scopes what's shown to what was requested)
 */
export const PROFILE_SECTION_KEYS = [
  "BASIC_INFO",
  "LINKS",
  "EDUCATION",
  "SKILLS",
  "EXPERIENCE",
  "INTERNSHIPS",
  "PROJECTS",
  "CERTIFICATIONS",
  "VOLUNTEERING",
  "PUBLICATIONS",
  "AWARDS",
  "LANGUAGES",
] as const;

export type ProfileSectionKey = (typeof PROFILE_SECTION_KEYS)[number];

export const PROFILE_SECTION_LABELS: Record<ProfileSectionKey, string> = {
  BASIC_INFO: "Basic info & summary",
  LINKS: "GitHub, LinkedIn, portfolio & other links",
  EDUCATION: "Education",
  SKILLS: "Skills",
  EXPERIENCE: "Work experience",
  INTERNSHIPS: "Internships",
  PROJECTS: "Projects",
  CERTIFICATIONS: "Certifications",
  VOLUNTEERING: "Volunteering",
  PUBLICATIONS: "Research papers & publications",
  AWARDS: "Awards & achievements",
  LANGUAGES: "Languages",
};

/** Pre-checked baseline when an employer creates a job without customizing this. */
export const DEFAULT_REQUESTED_SECTIONS: ProfileSectionKey[] = [
  "BASIC_INFO",
  "EDUCATION",
  "SKILLS",
  "EXPERIENCE",
  "PROJECTS",
];

export function isProfileSectionKey(value: string): value is ProfileSectionKey {
  return (PROFILE_SECTION_KEYS as readonly string[]).includes(value);
}

export function sanitizeSections(values: string[]): ProfileSectionKey[] {
  const filtered = values.filter(isProfileSectionKey);
  return filtered.length > 0 ? Array.from(new Set(filtered)) : [...DEFAULT_REQUESTED_SECTIONS];
}
