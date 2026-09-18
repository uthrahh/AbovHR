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

const basicInfoSchema = z
  .object({
    firstName: nameField,
    lastName: nameField,
    headline: z.string().trim().max(120).optional(),
    summary: z.string().trim().max(1000).optional(),
    githubUrl: urlField,
    linkedinUrl: urlField,
    portfolioUrl: urlField,
    locationCity: z.string().trim().max(80).optional(),
    locationState: z.string().trim().max(80).optional(),
    experienceYears: z.coerce.number().min(0).max(50).optional(),
    availability: z.enum(["IMMEDIATELY", "WITHIN_2_WEEKS", "WITHIN_A_MONTH", "NOT_LOOKING"]),
    salaryExpectationMin: z.coerce.number().min(0).optional(),
    salaryExpectationMax: z.coerce.number().min(0).optional(),
    preferredRoles: z.string().trim().max(300).optional(),
    preferredWorkModes: z.array(z.enum(["REMOTE", "HYBRID", "OFFICE", "FIELD"])).default([]),
    preferredEmploymentTypes: z.array(z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "APPRENTICESHIP", "CONTRACT"])).default([]),
  })
  .refine((d) => !d.salaryExpectationMin || !d.salaryExpectationMax || d.salaryExpectationMax >= d.salaryExpectationMin, {
    message: "Maximum salary expectation can't be below the minimum.",
    path: ["salaryExpectationMax"],
  });

export type ActionState = { ok: boolean; message?: string } | undefined;

export async function updateBasicInfoAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCandidateProfile();

  const parsed = basicInfoSchema.safeParse({
    firstName: formData.get("firstName") || undefined,
    lastName: formData.get("lastName") || undefined,
    headline: formData.get("headline") || undefined,
    summary: formData.get("summary") || undefined,
    githubUrl: formData.get("githubUrl") || undefined,
    linkedinUrl: formData.get("linkedinUrl") || undefined,
    portfolioUrl: formData.get("portfolioUrl") || undefined,
    locationCity: formData.get("locationCity") || undefined,
    locationState: formData.get("locationState") || undefined,
    experienceYears: formData.get("experienceYears") || undefined,
    availability: formData.get("availability") || "NOT_LOOKING",
    salaryExpectationMin: formData.get("salaryExpectationMin") || undefined,
    salaryExpectationMax: formData.get("salaryExpectationMax") || undefined,
    preferredRoles: formData.get("preferredRoles") || undefined,
    preferredWorkModes: formData.getAll("preferredWorkModes"),
    preferredEmploymentTypes: formData.getAll("preferredEmploymentTypes"),
  });

  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the highlighted fields." };

  await prisma.candidateProfile.update({
    where: { id: profile.id },
    data: {
      firstName: parsed.data.firstName || null,
      lastName: parsed.data.lastName || null,
      headline: parsed.data.headline,
      summary: parsed.data.summary,
      githubUrl: parsed.data.githubUrl || null,
      linkedinUrl: parsed.data.linkedinUrl || null,
      portfolioUrl: parsed.data.portfolioUrl || null,
      locationCity: parsed.data.locationCity,
      locationState: parsed.data.locationState,
      experienceYears: parsed.data.experienceYears,
      availability: parsed.data.availability,
      salaryExpectationMin: parsed.data.salaryExpectationMin,
      salaryExpectationMax: parsed.data.salaryExpectationMax,
      preferredRoles: parsed.data.preferredRoles
        ? parsed.data.preferredRoles.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      preferredWorkModes: parsed.data.preferredWorkModes,
      preferredEmploymentTypes: parsed.data.preferredEmploymentTypes,
    },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { ok: true, message: "Profile updated." };
}

const CURRENT_YEAR = new Date().getFullYear();
const EDUCATION_LEVELS = ["SECONDARY", "HIGHER_SECONDARY", "DIPLOMA", "UNDERGRADUATE", "POSTGRADUATE", "DOCTORATE", "CERTIFICATE_PROGRAM", "OTHER"] as const;

const educationSchema = z
  .object({
    level: z.enum(EDUCATION_LEVELS),
    institutionName: z.string().trim().min(2, "Enter an institution name.").max(150),
    degree: z.string().trim().min(2, "Enter a degree or qualification.").max(120),
    fieldOfStudy: z.string().trim().max(120).optional(),
    startYear: z.coerce.number().int().min(1970).max(CURRENT_YEAR + 1).optional(),
    endYear: z.coerce.number().int().min(1970).max(CURRENT_YEAR + 10).optional(),
    gradeValue: z.string().trim().max(30).optional(),
  })
  .refine((data) => !data.startYear || !data.endYear || data.endYear >= data.startYear, {
    message: "End year can't be before start year.",
    path: ["endYear"],
  });

export async function addEducationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCandidateProfile();
  const parsed = educationSchema.safeParse({
    level: formData.get("level") || "UNDERGRADUATE",
    institutionName: formData.get("institutionName"),
    degree: formData.get("degree"),
    fieldOfStudy: formData.get("fieldOfStudy") || undefined,
    startYear: formData.get("startYear") || undefined,
    endYear: formData.get("endYear") || undefined,
    gradeValue: formData.get("gradeValue") || undefined,
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the highlighted fields." };

  await prisma.education.create({ data: { candidateProfileId: profile.id, ...parsed.data } });
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

const skillSchema = z.object({
  skillName: z.string().trim().min(1).max(60),
  proficiency: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
});

export async function addSkillAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCandidateProfile();
  const parsed = skillSchema.safeParse({
    skillName: formData.get("skillName"),
    proficiency: formData.get("proficiency") || "BEGINNER",
  });
  if (!parsed.success) return { ok: false, message: "Enter a skill name." };

  const skill = await prisma.skill.upsert({
    where: { name: parsed.data.skillName },
    update: {},
    create: { name: parsed.data.skillName },
  });

  await prisma.candidateSkill.upsert({
    where: { candidateProfileId_skillId: { candidateProfileId: profile.id, skillId: skill.id } },
    update: { proficiency: parsed.data.proficiency },
    create: { candidateProfileId: profile.id, skillId: skill.id, proficiency: parsed.data.proficiency },
  });

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
