"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { requireUser, ForbiddenError } from "@/lib/auth/rbac";
import { buildAtsSectionText } from "@/lib/data/candidate";
import { computeAtsScore } from "@/lib/matching/ats-score";
import { sanitizeSections } from "@/lib/profile/sections";

export type ApplyState = { ok: boolean; message: string } | undefined;

export async function applyToJobAction(_prevState: ApplyState, formData: FormData): Promise<ApplyState> {
  const jobId = formData.get("jobId");
  const coverNote = formData.get("coverNote");
  if (typeof jobId !== "string" || !jobId) {
    return { ok: false, message: "Missing job reference." };
  }

  const user = await requireUser().catch(() => null);
  if (!user) {
    return { ok: false, message: "Sign in to apply." };
  }
  if (user.role !== "CANDIDATE") {
    return { ok: false, message: "Only candidate accounts can apply to jobs." };
  }

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: user.id },
    include: {
      resumes: { where: { isPrimary: true }, take: 1 },
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
    },
  });
  if (!profile) {
    return { ok: false, message: "Complete your candidate profile before applying." };
  }

  const job = await prisma.job.findUnique({ where: { id: jobId }, include: { skills: { include: { skill: true } } } });
  if (!job || job.status !== "PUBLISHED") {
    return { ok: false, message: "This job is no longer accepting applications." };
  }
  if (job.applicationMethod !== "EASY_APPLY") {
    return { ok: false, message: "This job requires applying on the company's site." };
  }

  const existing = await prisma.application.findUnique({
    where: { jobId_candidateProfileId: { jobId, candidateProfileId: profile.id } },
  });
  if (existing) {
    return { ok: true, message: "You've already applied to this job." };
  }

  // ATS scoring and data sharing are both scoped to exactly the sections this
  // employer requested — nothing outside that list is read or stored here.
  const sharedSections = sanitizeSections(job.requestedSections);
  const sectionText = buildAtsSectionText(profile, sharedSections);
  const atsResult = computeAtsScore(
    {
      title: job.title,
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      requiredSkillNames: job.skills.map((s) => s.skill.name),
    },
    profile.skills.map((s) => s.skill.name),
    sectionText,
    sharedSections
  );

  await prisma.application.create({
    data: {
      jobId,
      candidateProfileId: profile.id,
      resumeId: profile.resumes[0]?.id,
      resumeUrlSnapshot: profile.resumes[0]?.fileUrl,
      coverNote: typeof coverNote === "string" && coverNote.trim() ? coverNote.slice(0, 2000) : undefined,
      status: "APPLIED",
      atsScore: atsResult.score,
      atsBreakdown: atsResult as unknown as Prisma.InputJsonValue,
      sharedSections,
      statusHistory: { create: { toStatus: "APPLIED", changedByUserId: user.id } },
    },
  });

  const employerMembers = await prisma.employerMember.findMany({
    where: { companyId: job.companyId },
    select: { userId: true },
  });
  if (employerMembers.length > 0) {
    await prisma.notification.createMany({
      data: employerMembers.map((m) => ({
        userId: m.userId,
        type: "NEW_APPLICANT" as const,
        title: "New applicant",
        body: `${user.name} applied to ${job.title}.`,
        linkUrl: `/employer/jobs/${job.id}/applicants`,
      })),
    });
  }

  revalidatePath(`/jobs/${job.slug}`);
  revalidatePath("/dashboard");

  return { ok: true, message: `Application submitted for ${job.title}.` };
}

export async function withdrawApplicationAction(applicationId: string) {
  const user = await requireUser();
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { candidateProfile: true, job: true },
  });
  if (!application || application.candidateProfile.userId !== user.id) {
    throw new ForbiddenError("You can only withdraw your own applications.");
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: "WITHDRAWN",
      statusHistory: { create: { fromStatus: application.status, toStatus: "WITHDRAWN", changedByUserId: user.id } },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/jobs/${application.job.slug}`);
}
