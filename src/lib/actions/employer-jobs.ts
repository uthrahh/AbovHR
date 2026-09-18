"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireEmployerMembershipStrict } from "@/lib/auth/employer";
import { requireUser } from "@/lib/auth/rbac";
import { slugify } from "@/lib/utils";
import { sanitizeSections } from "@/lib/profile/sections";

const jobSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(20).max(6000),
  responsibilities: z.string().trim().max(4000).optional(),
  requirements: z.string().trim().max(4000).optional(),
  department: z.string().trim().max(80).optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "APPRENTICESHIP", "CONTRACT"]),
  workMode: z.enum(["REMOTE", "HYBRID", "OFFICE", "FIELD"]),
  experienceMinYears: z.coerce.number().min(0).max(50).optional(),
  experienceMaxYears: z.coerce.number().min(0).max(50).optional(),
  educationRequirement: z.string().trim().max(150).optional(),
  salaryMin: z.coerce.number().min(0).optional(),
  salaryMax: z.coerce.number().min(0).optional(),
  isSalaryDisclosed: z.boolean().default(false),
  locationCity: z.string().trim().max(80).optional(),
  isFresherFriendly: z.boolean().default(false),
  applicationMethod: z.enum(["EASY_APPLY", "EXTERNAL_URL"]),
  externalApplyUrl: z.string().trim().url().optional().or(z.literal("")),
  applicationDeadline: z.string().optional(),
  skills: z.string().optional(),
  requestedSections: z.array(z.string()).default([]),
});

export type JobFormState = { ok: boolean; message?: string; jobId?: string } | undefined;

function parseJobForm(formData: FormData) {
  return jobSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    responsibilities: formData.get("responsibilities") || undefined,
    requirements: formData.get("requirements") || undefined,
    department: formData.get("department") || undefined,
    employmentType: formData.get("employmentType"),
    workMode: formData.get("workMode"),
    experienceMinYears: formData.get("experienceMinYears") || undefined,
    experienceMaxYears: formData.get("experienceMaxYears") || undefined,
    educationRequirement: formData.get("educationRequirement") || undefined,
    salaryMin: formData.get("salaryMin") || undefined,
    salaryMax: formData.get("salaryMax") || undefined,
    isSalaryDisclosed: formData.get("isSalaryDisclosed") === "on",
    locationCity: formData.get("locationCity") || undefined,
    isFresherFriendly: formData.get("isFresherFriendly") === "on",
    applicationMethod: formData.get("applicationMethod") || "EASY_APPLY",
    externalApplyUrl: formData.get("externalApplyUrl") || "",
    applicationDeadline: formData.get("applicationDeadline") || undefined,
    skills: formData.get("skills") || undefined,
    requestedSections: formData.getAll("requestedSections"),
  });
}

async function syncJobSkills(jobId: string, skillsCsv: string | undefined) {
  const names = (skillsCsv ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.jobSkill.deleteMany({ where: { jobId } });
  for (const name of names) {
    const skill = await prisma.skill.upsert({ where: { name }, update: {}, create: { name } });
    await prisma.jobSkill.create({ data: { jobId, skillId: skill.id, isRequired: true } });
  }
}

export async function createJobAction(status: "DRAFT" | "PUBLISHED", _prevState: JobFormState, formData: FormData): Promise<JobFormState> {
  const user = await requireUser();
  const membership = await requireEmployerMembershipStrict(user.id);

  const parsed = parseJobForm(formData);
  if (!parsed.success) {
    return { ok: false, message: "Please check the highlighted fields." };
  }
  if (parsed.data.applicationMethod === "EXTERNAL_URL" && !parsed.data.externalApplyUrl) {
    return { ok: false, message: "Add an external application URL." };
  }

  let slug = slugify(`${membership.company.slug}-${parsed.data.title}`);
  const slugExists = await prisma.job.findUnique({ where: { slug } });
  if (slugExists) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const job = await prisma.job.create({
    data: {
      companyId: membership.companyId,
      createdByUserId: user.id,
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      responsibilities: parsed.data.responsibilities,
      requirements: parsed.data.requirements,
      department: parsed.data.department,
      employmentType: parsed.data.employmentType,
      workMode: parsed.data.workMode,
      experienceMinYears: parsed.data.experienceMinYears,
      experienceMaxYears: parsed.data.experienceMaxYears,
      educationRequirement: parsed.data.educationRequirement,
      salaryMin: parsed.data.salaryMin,
      salaryMax: parsed.data.salaryMax,
      isSalaryDisclosed: parsed.data.isSalaryDisclosed,
      locationCity: parsed.data.locationCity,
      isFresherFriendly: parsed.data.isFresherFriendly,
      applicationMethod: parsed.data.applicationMethod,
      externalApplyUrl: parsed.data.externalApplyUrl || null,
      applicationDeadline: parsed.data.applicationDeadline ? new Date(parsed.data.applicationDeadline) : null,
      requestedSections: sanitizeSections(parsed.data.requestedSections),
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });

  await syncJobSkills(job.id, parsed.data.skills);

  revalidatePath("/employer/jobs");
  redirect(`/employer/jobs/${job.id}`);
}

export async function updateJobAction(jobId: string, _prevState: JobFormState, formData: FormData): Promise<JobFormState> {
  const user = await requireUser();
  const membership = await requireEmployerMembershipStrict(user.id);

  const job = await prisma.job.findFirst({ where: { id: jobId, companyId: membership.companyId } });
  if (!job) return { ok: false, message: "Job not found." };

  const parsed = parseJobForm(formData);
  if (!parsed.success) return { ok: false, message: "Please check the highlighted fields." };

  await prisma.job.update({
    where: { id: jobId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      responsibilities: parsed.data.responsibilities,
      requirements: parsed.data.requirements,
      department: parsed.data.department,
      employmentType: parsed.data.employmentType,
      workMode: parsed.data.workMode,
      experienceMinYears: parsed.data.experienceMinYears,
      experienceMaxYears: parsed.data.experienceMaxYears,
      educationRequirement: parsed.data.educationRequirement,
      salaryMin: parsed.data.salaryMin,
      salaryMax: parsed.data.salaryMax,
      isSalaryDisclosed: parsed.data.isSalaryDisclosed,
      locationCity: parsed.data.locationCity,
      isFresherFriendly: parsed.data.isFresherFriendly,
      applicationMethod: parsed.data.applicationMethod,
      externalApplyUrl: parsed.data.externalApplyUrl || null,
      applicationDeadline: parsed.data.applicationDeadline ? new Date(parsed.data.applicationDeadline) : null,
      requestedSections: sanitizeSections(parsed.data.requestedSections),
    },
  });

  await syncJobSkills(jobId, parsed.data.skills);

  revalidatePath(`/employer/jobs/${jobId}`);
  return { ok: true, message: "Job updated." };
}

export async function setJobStatusAction(jobId: string, status: "PUBLISHED" | "CLOSED" | "ARCHIVED" | "DRAFT") {
  const user = await requireUser();
  const membership = await requireEmployerMembershipStrict(user.id);
  const job = await prisma.job.findFirst({ where: { id: jobId, companyId: membership.companyId } });
  if (!job) return;

  await prisma.job.update({
    where: { id: jobId },
    data: { status, publishedAt: status === "PUBLISHED" && !job.publishedAt ? new Date() : job.publishedAt },
  });
  revalidatePath("/employer/jobs");
  revalidatePath(`/employer/jobs/${jobId}`);
}
