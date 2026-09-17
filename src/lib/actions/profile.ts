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

const basicInfoSchema = z.object({
  headline: z.string().trim().max(120).optional(),
  summary: z.string().trim().max(1000).optional(),
  locationCity: z.string().trim().max(80).optional(),
  locationState: z.string().trim().max(80).optional(),
  experienceYears: z.coerce.number().min(0).max(50).optional(),
  availability: z.enum(["IMMEDIATELY", "WITHIN_2_WEEKS", "WITHIN_A_MONTH", "NOT_LOOKING"]),
  salaryExpectationMin: z.coerce.number().min(0).optional(),
  salaryExpectationMax: z.coerce.number().min(0).optional(),
  preferredRoles: z.string().trim().max(300).optional(),
  preferredWorkModes: z.array(z.enum(["REMOTE", "HYBRID", "OFFICE", "FIELD"])).default([]),
  preferredEmploymentTypes: z.array(z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "APPRENTICESHIP", "CONTRACT"])).default([]),
});

export type ActionState = { ok: boolean; message?: string } | undefined;

export async function updateBasicInfoAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCandidateProfile();

  const parsed = basicInfoSchema.safeParse({
    headline: formData.get("headline") || undefined,
    summary: formData.get("summary") || undefined,
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

  if (!parsed.success) return { ok: false, message: "Please check the highlighted fields." };

  await prisma.candidateProfile.update({
    where: { id: profile.id },
    data: {
      headline: parsed.data.headline,
      summary: parsed.data.summary,
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

const educationSchema = z.object({
  institutionName: z.string().trim().min(2).max(150),
  degree: z.string().trim().min(2).max(120),
  fieldOfStudy: z.string().trim().max(120).optional(),
  startYear: z.coerce.number().min(1970).max(2100).optional(),
  endYear: z.coerce.number().min(1970).max(2100).optional(),
});

export async function addEducationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCandidateProfile();
  const parsed = educationSchema.safeParse({
    institutionName: formData.get("institutionName"),
    degree: formData.get("degree"),
    fieldOfStudy: formData.get("fieldOfStudy") || undefined,
    startYear: formData.get("startYear") || undefined,
    endYear: formData.get("endYear") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Enter an institution and degree." };

  await prisma.education.create({ data: { candidateProfileId: profile.id, ...parsed.data } });
  revalidatePath("/dashboard/profile");
  return { ok: true };
}

export async function deleteEducationAction(educationId: string) {
  const { profile } = await requireCandidateProfile();
  await prisma.education.deleteMany({ where: { id: educationId, candidateProfileId: profile.id } });
  revalidatePath("/dashboard/profile");
}

const experienceSchema = z.object({
  company: z.string().trim().min(2).max(150),
  title: z.string().trim().min(2).max(150),
  startDate: z.coerce.date(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().trim().max(1000).optional(),
});

export async function addExperienceAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireCandidateProfile();
  const isCurrent = formData.get("isCurrent") === "on";
  const parsed = experienceSchema.safeParse({
    company: formData.get("company"),
    title: formData.get("title"),
    startDate: formData.get("startDate"),
    isCurrent,
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Enter a company, title, and start date." };

  const endDateRaw = formData.get("endDate");
  await prisma.experience.create({
    data: {
      candidateProfileId: profile.id,
      company: parsed.data.company,
      title: parsed.data.title,
      startDate: parsed.data.startDate,
      endDate: !isCurrent && typeof endDateRaw === "string" && endDateRaw ? new Date(endDateRaw) : null,
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
