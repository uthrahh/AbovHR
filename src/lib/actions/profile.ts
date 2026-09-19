"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/rbac";

async function requireCandidateProfile() {
  const user = await requireUser();
  if (user.role !== "CANDIDATE") throw new Error("Only candidates have a candidate profile.");
  const profile = await prisma.candidateProfile.findUnique({ where: { userId: user.id } });
  if (!profile) throw new Error("Profile not found.");
  return { user, profile };
}

const NAME_PATTERN = /^[\p{L}][\p{L}'.\- ]{0,79}$/u;
const nameField = z.string().trim().regex(NAME_PATTERN, "Use letters only (hyphens and apostrophes are fine).").optional().or(z.literal(""));
const urlField = z.string().trim().max(300).url("Enter a full URL, e.g. https://…").optional().or(z.literal(""));

const GITHUB_USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
const LINKEDIN_USERNAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9-]{2,99}$/;

/** Strips a pasted full profile URL down to just the username, if one was pasted. */
function extractUsername(raw: string, hosts: string[]): string {
  let value = raw.trim();
  for (const host of hosts) {
    // Protocol and "www." are both optional — people paste "linkedin.com/in/x" as often as the full URL.
    const withHost = new RegExp(`^(https?://)?(www\\.)?${host}/(in/)?`, "i");
    value = value.replace(withHost, "");
  }
  return value.replace(/\/+$/, "").trim();
}

const githubUsernameField = z
  .string()
  .trim()
  .transform((v) => extractUsername(v, ["github\\.com"]))
  .refine((v) => v === "" || GITHUB_USERNAME_PATTERN.test(v), "Enter just your GitHub username, e.g. octocat.")
  .optional()
  .or(z.literal(""));

const linkedinUsernameField = z
  .string()
  .trim()
  .transform((v) => extractUsername(v, ["linkedin\\.com"]))
  .refine((v) => v === "" || LINKEDIN_USERNAME_PATTERN.test(v), "Enter just your LinkedIn username, e.g. jane-doe.")
  .optional()
  .or(z.literal(""));

const PREFERRED_ROLE_MAX = 10;

const basicInfoSchema = z
  .object({
    firstName: nameField,
    lastName: nameField,
    headline: z.string().trim().max(120).optional(),
    summary: z.string().trim().max(1000).optional(),
    githubUsername: githubUsernameField,
    linkedinUsername: linkedinUsernameField,
    portfolioUrl: urlField,
    locationCity: z.string().trim().max(80).optional(),
    locationState: z.string().trim().max(80).optional(),
    experienceYears: z.coerce.number().min(0).max(50).optional(),
    availability: z.enum(["IMMEDIATELY", "WITHIN_2_WEEKS", "WITHIN_A_MONTH", "NOT_LOOKING"]),
    salaryExpectationMin: z.coerce.number().min(0).optional(),
    salaryExpectationMax: z.coerce.number().min(0).optional(),
    preferredRoles: z.array(z.string().trim().min(1).max(80)).max(PREFERRED_ROLE_MAX).default([]),
    preferredWorkModes: z.array(z.enum(["REMOTE", "HYBRID", "OFFICE", "FIELD"])).default([]),
    preferredEmploymentTypes: z.array(z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "APPRENTICESHIP", "CONTRACT"])).default([]),
  })
  .refine((d) => !d.salaryExpectationMin || !d.salaryExpectationMax || d.salaryExpectationMax >= d.salaryExpectationMin, {
    message: "Maximum salary expectation can't be below the minimum.",
    path: ["salaryExpectationMax"],
  });

export type ActionState = { ok: boolean; message?: string } | undefined;
export type BasicInfoState = { ok: boolean; message?: string; fieldErrors?: Record<string, string> } | undefined;

export async function updateBasicInfoAction(_prevState: BasicInfoState, formData: FormData): Promise<BasicInfoState> {
  const { profile } = await requireCandidateProfile();

  const parsed = basicInfoSchema.safeParse({
    firstName: formData.get("firstName") || undefined,
    lastName: formData.get("lastName") || undefined,
    headline: formData.get("headline") || undefined,
    summary: formData.get("summary") || undefined,
    githubUsername: formData.get("githubUsername") || "",
    linkedinUsername: formData.get("linkedinUsername") || "",
    portfolioUrl: formData.get("portfolioUrl") || undefined,
    locationCity: formData.get("locationCity") || undefined,
    locationState: formData.get("locationState") || undefined,
    experienceYears: formData.get("experienceYears") || undefined,
    availability: formData.get("availability") || "NOT_LOOKING",
    salaryExpectationMin: formData.get("salaryExpectationMin") || undefined,
    salaryExpectationMax: formData.get("salaryExpectationMax") || undefined,
    preferredRoles: formData.getAll("preferredRoles"),
    preferredWorkModes: formData.getAll("preferredWorkModes"),
    preferredEmploymentTypes: formData.getAll("preferredEmploymentTypes"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors };
  }

  await prisma.candidateProfile.update({
    where: { id: profile.id },
    data: {
      firstName: parsed.data.firstName || null,
      lastName: parsed.data.lastName || null,
      headline: parsed.data.headline,
      summary: parsed.data.summary,
      githubUrl: parsed.data.githubUsername ? `https://github.com/${parsed.data.githubUsername}` : null,
      linkedinUrl: parsed.data.linkedinUsername ? `https://linkedin.com/in/${parsed.data.linkedinUsername}` : null,
      portfolioUrl: parsed.data.portfolioUrl || null,
      locationCity: parsed.data.locationCity,
      locationState: parsed.data.locationState,
      experienceYears: parsed.data.experienceYears,
      availability: parsed.data.availability,
      salaryExpectationMin: parsed.data.salaryExpectationMin,
      salaryExpectationMax: parsed.data.salaryExpectationMax,
      preferredRoles: parsed.data.preferredRoles,
      preferredWorkModes: parsed.data.preferredWorkModes,
      preferredEmploymentTypes: parsed.data.preferredEmploymentTypes,
    },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { ok: true, message: "Profile updated." };
}

const EDUCATION_LEVEL_LABEL: Record<string, string> = {
  SECONDARY: "10th",
  HIGHER_SECONDARY: "12th",
  DIPLOMA: "a diploma",
  UNDERGRADUATE: "an undergraduate degree",
  POSTGRADUATE: "a postgraduate degree",
  DOCTORATE: "a doctorate",
  CERTIFICATE_PROGRAM: "a certificate program",
  OTHER: "other education",
};

function joinWithAnd(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/**
 * Builds a professional summary deterministically from the candidate's own
 * saved profile data — no external AI call, so the result is always
 * traceable back to fields the candidate entered.
 */
export async function generateSummaryAction(): Promise<{ ok: true; summary: string } | { ok: false; message: string }> {
  const { profile } = await requireCandidateProfile();

  const data = await prisma.candidateProfile.findUnique({
    where: { id: profile.id },
    include: {
      skills: { include: { skill: true }, orderBy: { skill: { name: "asc" } } },
      educations: true,
      experiences: { orderBy: { startDate: "desc" } },
    },
  });
  if (!data) return { ok: false, message: "Profile not found." };

  const sentences: string[] = [];

  const roleLabel = data.headline?.trim() || data.preferredRoles[0] || "Motivated professional";
  const expYears = data.experienceYears ? Number(data.experienceYears) : 0;
  let opening = roleLabel;
  if (expYears > 0) {
    opening += ` with ${expYears} year${expYears === 1 ? "" : "s"} of experience`;
  } else if (data.experiences.length === 0) {
    opening += ", early in their career";
  }
  sentences.push(`${opening}.`);

  const highestEducation =
    data.educations.find((e) => e.level === "DOCTORATE") ??
    data.educations.find((e) => e.level === "POSTGRADUATE") ??
    data.educations.find((e) => e.level === "UNDERGRADUATE");
  if (highestEducation) {
    const levelLabel = EDUCATION_LEVEL_LABEL[highestEducation.level] ?? "a degree";
    const fieldBit = highestEducation.fieldOfStudy ? ` in ${highestEducation.fieldOfStudy}` : "";
    const institutionBit = highestEducation.institutionName ? ` from ${highestEducation.institutionName}` : "";
    sentences.push(`Holds ${levelLabel}${fieldBit}${institutionBit}.`);
  }

  const latestExperience = data.experiences[0];
  if (latestExperience) {
    const verb = latestExperience.isCurrent ? "Currently working as" : "Most recently worked as";
    sentences.push(`${verb} ${latestExperience.title} at ${latestExperience.company}.`);
  }

  const topSkills = data.skills.slice(0, 6).map((s) => s.skill.name);
  if (topSkills.length > 0) {
    sentences.push(`Skilled in ${joinWithAnd(topSkills)}.`);
  }

  if (data.preferredRoles.length > 0) {
    sentences.push(`Looking for opportunities as ${joinWithAnd(data.preferredRoles)}.`);
  }

  const summary = sentences.join(" ").trim();
  if (!summary) {
    return { ok: false, message: "Add a headline, education, or skills first so we have something to summarize." };
  }
  return { ok: true, summary };
}

const CURRENT_YEAR = new Date().getFullYear();
const EDUCATION_LEVELS = ["SECONDARY", "HIGHER_SECONDARY", "DIPLOMA", "UNDERGRADUATE", "POSTGRADUATE", "DOCTORATE", "CERTIFICATE_PROGRAM", "OTHER"] as const;
const MANDATORY_EDUCATION_LEVELS = ["SECONDARY", "HIGHER_SECONDARY", "UNDERGRADUATE"] as const;
const EXTRA_EDUCATION_LEVELS = ["POSTGRADUATE", "DOCTORATE", "DIPLOMA", "CERTIFICATE_PROGRAM", "OTHER"] as const;

function levelRequiresBoard(level: string) {
  return level === "SECONDARY" || level === "HIGHER_SECONDARY";
}

const educationSchema = z
  .object({
    level: z.enum(EDUCATION_LEVELS),
    institutionName: z.string().trim().min(2, "Enter an institution name.").max(150),
    degree: z.string().trim().min(2, "Enter a degree or qualification.").max(120),
    fieldOfStudy: z.string().trim().min(2, "Enter a field of study or stream.").max(120),
    board: z.string().trim().max(120).optional(),
    startYear: z.coerce.number({ error: "Enter a valid start year." }).int().min(1970).max(CURRENT_YEAR + 1),
    endYear: z.coerce.number({ error: "Enter a valid end year." }).int().min(1970).max(CURRENT_YEAR + 10),
    gradeValue: z.string().trim().min(1, "Enter your grade, percentage, or CGPA.").max(30),
  })
  .refine((data) => data.endYear >= data.startYear, { message: "End year can't be before start year.", path: ["endYear"] })
  .refine((data) => !levelRequiresBoard(data.level) || (data.board ?? "").length > 0, {
    message: "Enter your board, e.g. CBSE, ICSE, or State Board.",
    path: ["board"],
  });

export type EducationState = { ok: boolean; message?: string; fieldErrors?: Record<string, string> } | undefined;

function educationFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString();
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

function parseEducationForm(formData: FormData, level: string) {
  return educationSchema.safeParse({
    level,
    institutionName: formData.get("institutionName"),
    degree: formData.get("degree"),
    fieldOfStudy: formData.get("fieldOfStudy"),
    board: formData.get("board") || undefined,
    startYear: formData.get("startYear"),
    endYear: formData.get("endYear"),
    gradeValue: formData.get("gradeValue"),
  });
}

/** Upserts the single row for a mandatory level (10th / 12th / UG) — one row per level, never duplicated. */
export async function saveMandatoryEducationAction(
  level: (typeof MANDATORY_EDUCATION_LEVELS)[number],
  _prevState: EducationState,
  formData: FormData
): Promise<EducationState> {
  const { profile } = await requireCandidateProfile();
  const parsed = parseEducationForm(formData, level);
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: educationFieldErrors(parsed.error) };

  const data = {
    institutionName: parsed.data.institutionName,
    degree: parsed.data.degree,
    fieldOfStudy: parsed.data.fieldOfStudy,
    board: parsed.data.board || null,
    startYear: parsed.data.startYear,
    endYear: parsed.data.endYear,
    gradeValue: parsed.data.gradeValue,
  };

  const existing = await prisma.education.findFirst({ where: { candidateProfileId: profile.id, level } });
  if (existing) {
    await prisma.education.update({ where: { id: existing.id }, data });
  } else {
    await prisma.education.create({ data: { candidateProfileId: profile.id, level, ...data } });
  }
  revalidatePath("/dashboard/profile");
  return { ok: true, message: "Saved." };
}

export async function addEducationAction(_prevState: EducationState, formData: FormData): Promise<EducationState> {
  const { profile } = await requireCandidateProfile();
  const level = formData.get("level")?.toString() ?? "POSTGRADUATE";
  const parsed = parseEducationForm(formData, level);
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: educationFieldErrors(parsed.error) };

  await prisma.education.create({
    data: {
      candidateProfileId: profile.id,
      level: parsed.data.level,
      institutionName: parsed.data.institutionName,
      degree: parsed.data.degree,
      fieldOfStudy: parsed.data.fieldOfStudy,
      board: parsed.data.board || null,
      startYear: parsed.data.startYear,
      endYear: parsed.data.endYear,
      gradeValue: parsed.data.gradeValue,
    },
  });
  revalidatePath("/dashboard/profile");
  return { ok: true };
}

export async function deleteEducationAction(educationId: string) {
  const { profile } = await requireCandidateProfile();
  await prisma.education.deleteMany({ where: { id: educationId, candidateProfileId: profile.id } });
  revalidatePath("/dashboard/profile");
}

const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "INTERNSHIP", "APPRENTICESHIP", "CONTRACT"] as const;

const experienceSchema = z.object({
  employmentType: z.enum(EMPLOYMENT_TYPES),
  company: z.string().trim().min(2, "Enter a company or organization name.").max(150),
  title: z.string().trim().min(2, "Enter a job title.").max(150),
  startDate: z.coerce.date({ error: "Enter a valid start date." }),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().trim().max(1000).optional(),
});

export async function addExperienceAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCandidateProfile();
  const isCurrent = formData.get("isCurrent") === "on";
  const parsed = experienceSchema.safeParse({
    employmentType: formData.get("employmentType") || "FULL_TIME",
    company: formData.get("company"),
    title: formData.get("title"),
    startDate: formData.get("startDate"),
    isCurrent,
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the highlighted fields." };

  const endDateRaw = formData.get("endDate");
  const endDate = !isCurrent && typeof endDateRaw === "string" && endDateRaw ? new Date(endDateRaw) : null;
  if (endDate && endDate < parsed.data.startDate) {
    return { ok: false, message: "End date can't be before the start date." };
  }
  if (parsed.data.startDate > new Date()) {
    return { ok: false, message: "Start date can't be in the future." };
  }

  await prisma.experience.create({
    data: {
      candidateProfileId: profile.id,
      employmentType: parsed.data.employmentType,
      company: parsed.data.company,
      title: parsed.data.title,
      startDate: parsed.data.startDate,
      endDate,
      isCurrent,
      description: parsed.data.description,
    },
  });
  revalidatePath("/dashboard/profile");
  return { ok: true };
}

export async function deleteExperienceAction(experienceId: string) {
  const { profile } = await requireCandidateProfile();
  await prisma.experience.deleteMany({ where: { id: experienceId, candidateProfileId: profile.id } });
  revalidatePath("/dashboard/profile");
}

const skillsSchema = z.object({
  skillNames: z.array(z.string().trim().min(1).max(60)).min(1, "Choose at least one skill."),
});

/** Adds one or more skills at once — no per-skill form submission, no proficiency. */
export async function addSkillsAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCandidateProfile();
  const raw = formData.getAll("skillNames").map(String).filter(Boolean);
  const parsed = skillsSchema.safeParse({ skillNames: raw });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Choose at least one skill." };

  for (const name of parsed.data.skillNames) {
    const skill = await prisma.skill.upsert({ where: { name }, update: {}, create: { name } });
    await prisma.candidateSkill.upsert({
      where: { candidateProfileId_skillId: { candidateProfileId: profile.id, skillId: skill.id } },
      update: {},
      create: { candidateProfileId: profile.id, skillId: skill.id },
    });
  }

  revalidatePath("/dashboard/profile");
  return { ok: true };
}

export async function removeSkillAction(skillId: string) {
  const { profile } = await requireCandidateProfile();
  await prisma.candidateSkill.deleteMany({ where: { candidateProfileId: profile.id, skillId } });
  revalidatePath("/dashboard/profile");
}

export async function setPrimaryResumeAction(resumeId: string) {
  const { profile } = await requireCandidateProfile();
  const resume = await prisma.resume.findFirst({ where: { id: resumeId, candidateProfileId: profile.id } });
  if (!resume) return;
  await prisma.$transaction([
    prisma.resume.updateMany({ where: { candidateProfileId: profile.id }, data: { isPrimary: false } }),
    prisma.resume.update({ where: { id: resumeId }, data: { isPrimary: true } }),
  ]);
  revalidatePath("/dashboard/profile");
}

const projectSchema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional(),
  url: z.string().trim().url().optional().or(z.literal("")),
  skillsUsed: z.string().trim().max(300).optional(),
});

export async function addProjectAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCandidateProfile();
  const parsed = projectSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    url: formData.get("url") || "",
    skillsUsed: formData.get("skillsUsed") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Enter a project title." };

  await prisma.project.create({
    data: {
      candidateProfileId: profile.id,
      title: parsed.data.title,
      description: parsed.data.description,
      url: parsed.data.url || undefined,
      skillsUsed: parsed.data.skillsUsed ? parsed.data.skillsUsed.split(",").map((s) => s.trim()).filter(Boolean) : [],
    },
  });
  revalidatePath("/dashboard/profile");
  return { ok: true };
}

export async function deleteProjectAction(projectId: string) {
  const { profile } = await requireCandidateProfile();
  await prisma.project.deleteMany({ where: { id: projectId, candidateProfileId: profile.id } });
  revalidatePath("/dashboard/profile");
}

const certificationSchema = z.object({
  name: z.string().trim().min(2).max(150),
  issuer: z.string().trim().min(2).max(150),
  issueDate: z.string().optional(),
  credentialUrl: z.string().trim().url().optional().or(z.literal("")),
});

export async function addCertificationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCandidateProfile();
  const parsed = certificationSchema.safeParse({
    name: formData.get("name"),
    issuer: formData.get("issuer"),
    issueDate: formData.get("issueDate") || undefined,
    credentialUrl: formData.get("credentialUrl") || "",
  });
  if (!parsed.success) return { ok: false, message: "Enter a certification name and issuer." };

  await prisma.certification.create({
    data: {
      candidateProfileId: profile.id,
      name: parsed.data.name,
      issuer: parsed.data.issuer,
      issueDate: parsed.data.issueDate ? new Date(parsed.data.issueDate) : undefined,
      credentialUrl: parsed.data.credentialUrl || undefined,
    },
  });
  revalidatePath("/dashboard/profile");
  return { ok: true };
}

export async function deleteCertificationAction(certificationId: string) {
  const { profile } = await requireCandidateProfile();
  await prisma.certification.deleteMany({ where: { id: certificationId, candidateProfileId: profile.id } });
  revalidatePath("/dashboard/profile");
}

const languageSchema = z.object({
  name: z.string().trim().min(2).max(60),
  proficiency: z.enum(["BASIC", "CONVERSATIONAL", "FLUENT", "NATIVE"]),
});

export async function addLanguageAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCandidateProfile();
  const parsed = languageSchema.safeParse({
    name: formData.get("name"),
    proficiency: formData.get("proficiency") || "CONVERSATIONAL",
  });
  if (!parsed.success) return { ok: false, message: "Enter a language name." };

  await prisma.candidateLanguage.upsert({
    where: { candidateProfileId_name: { candidateProfileId: profile.id, name: parsed.data.name } },
    update: { proficiency: parsed.data.proficiency },
    create: { candidateProfileId: profile.id, name: parsed.data.name, proficiency: parsed.data.proficiency },
  });
  revalidatePath("/dashboard/profile");
  return { ok: true };
}

export async function deleteLanguageAction(languageId: string) {
  const { profile } = await requireCandidateProfile();
  await prisma.candidateLanguage.deleteMany({ where: { id: languageId, candidateProfileId: profile.id } });
  revalidatePath("/dashboard/profile");
}

const linkSchema = z.object({
  label: z.string().trim().min(2, "Give this link a short label.").max(60),
  url: z.string().trim().max(300).url("Enter a full URL, e.g. https://…"),
});

export async function addLinkAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCandidateProfile();
  const parsed = linkSchema.safeParse({ label: formData.get("label"), url: formData.get("url") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Enter a label and a valid URL." };

  const existingCount = await prisma.candidateLink.count({ where: { candidateProfileId: profile.id } });
  if (existingCount >= 10) return { ok: false, message: "You can add up to 10 additional links." };

  await prisma.candidateLink.create({ data: { candidateProfileId: profile.id, ...parsed.data } });
  revalidatePath("/dashboard/profile");
  return { ok: true };
}

export async function deleteLinkAction(linkId: string) {
  const { profile } = await requireCandidateProfile();
  await prisma.candidateLink.deleteMany({ where: { id: linkId, candidateProfileId: profile.id } });
  revalidatePath("/dashboard/profile");
}

const volunteeringSchema = z.object({
  organization: z.string().trim().min(2, "Enter an organization name.").max(150),
  role: z.string().trim().min(2, "Enter your role.").max(150),
  cause: z.string().trim().max(120).optional(),
  startDate: z.coerce.date({ error: "Enter a valid start date." }),
  isCurrent: z.boolean().default(false),
  description: z.string().trim().max(1000).optional(),
});

export async function addVolunteeringAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCandidateProfile();
  const isCurrent = formData.get("isCurrent") === "on";
  const parsed = volunteeringSchema.safeParse({
    organization: formData.get("organization"),
    role: formData.get("role"),
    cause: formData.get("cause") || undefined,
    startDate: formData.get("startDate"),
    isCurrent,
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the highlighted fields." };

  const endDateRaw = formData.get("endDate");
  const endDate = !isCurrent && typeof endDateRaw === "string" && endDateRaw ? new Date(endDateRaw) : null;
  if (endDate && endDate < parsed.data.startDate) {
    return { ok: false, message: "End date can't be before the start date." };
  }

  await prisma.volunteeringExperience.create({
    data: { candidateProfileId: profile.id, ...parsed.data, endDate },
  });
  revalidatePath("/dashboard/profile");
  return { ok: true };
}

export async function deleteVolunteeringAction(volunteeringId: string) {
  const { profile } = await requireCandidateProfile();
  await prisma.volunteeringExperience.deleteMany({ where: { id: volunteeringId, candidateProfileId: profile.id } });
  revalidatePath("/dashboard/profile");
}

const PUBLICATION_TYPES = ["RESEARCH_PAPER", "ARTICLE", "BOOK_CHAPTER", "PATENT", "CONFERENCE_PAPER", "OTHER"] as const;

const publicationSchema = z.object({
  title: z.string().trim().min(2, "Enter a title.").max(200),
  publicationType: z.enum(PUBLICATION_TYPES),
  venue: z.string().trim().max(150).optional(),
  authors: z.string().trim().max(300).optional(),
  publishedDate: z.string().optional(),
  url: z.string().trim().max(300).url("Enter a full URL, e.g. https://…").optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional(),
});

export async function addPublicationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCandidateProfile();
  const parsed = publicationSchema.safeParse({
    title: formData.get("title"),
    publicationType: formData.get("publicationType") || "RESEARCH_PAPER",
    venue: formData.get("venue") || undefined,
    authors: formData.get("authors") || undefined,
    publishedDate: formData.get("publishedDate") || undefined,
    url: formData.get("url") || "",
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the highlighted fields." };

  await prisma.publication.create({
    data: {
      candidateProfileId: profile.id,
      title: parsed.data.title,
      publicationType: parsed.data.publicationType,
      venue: parsed.data.venue,
      authors: parsed.data.authors,
      publishedDate: parsed.data.publishedDate ? new Date(parsed.data.publishedDate) : undefined,
      url: parsed.data.url || undefined,
      description: parsed.data.description,
    },
  });
  revalidatePath("/dashboard/profile");
  return { ok: true };
}

export async function deletePublicationAction(publicationId: string) {
  const { profile } = await requireCandidateProfile();
  await prisma.publication.deleteMany({ where: { id: publicationId, candidateProfileId: profile.id } });
  revalidatePath("/dashboard/profile");
}

const awardSchema = z.object({
  title: z.string().trim().min(2, "Enter a title.").max(150),
  issuer: z.string().trim().max(150).optional(),
  awardDate: z.string().optional(),
  description: z.string().trim().max(500).optional(),
});

export async function addAwardAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCandidateProfile();
  const parsed = awardSchema.safeParse({
    title: formData.get("title"),
    issuer: formData.get("issuer") || undefined,
    awardDate: formData.get("awardDate") || undefined,
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Enter a title." };

  await prisma.award.create({
    data: {
      candidateProfileId: profile.id,
      title: parsed.data.title,
      issuer: parsed.data.issuer,
      awardDate: parsed.data.awardDate ? new Date(parsed.data.awardDate) : undefined,
      description: parsed.data.description,
    },
  });
  revalidatePath("/dashboard/profile");
  return { ok: true };
}

export async function deleteAwardAction(awardId: string) {
  const { profile } = await requireCandidateProfile();
  await prisma.award.deleteMany({ where: { id: awardId, candidateProfileId: profile.id } });
  revalidatePath("/dashboard/profile");
}
