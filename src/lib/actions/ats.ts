"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { getFullCandidateProfile, buildAtsSectionText } from "@/lib/data/candidate";
import { computeAtsScore, type AtsBreakdown } from "@/lib/matching/ats-score";
import { sanitizeSections } from "@/lib/profile/sections";

export type CheckAtsState = { ok: true; result: AtsBreakdown } | { ok: false; message: string } | undefined;

export async function checkAtsScoreAction(_prevState: CheckAtsState, formData: FormData): Promise<CheckAtsState> {
  const jobId = formData.get("jobId");
  if (typeof jobId !== "string" || !jobId) return { ok: false, message: "Missing job reference." };

  const user = await requireUser().catch(() => null);
  if (!user) return { ok: false, message: "Sign in to check your ATS score." };
  if (user.role !== "CANDIDATE") return { ok: false, message: "Only candidate accounts have a profile to check." };

  const [job, profile] = await Promise.all([
    prisma.job.findUnique({ where: { id: jobId }, include: { skills: { include: { skill: true } } } }),
    getFullCandidateProfile(user.id),
  ]);

  if (!job) return { ok: false, message: "This job could not be found." };
  if (!profile) return { ok: false, message: "Complete your candidate profile first." };

  const requestedSections = sanitizeSections(job.requestedSections);
  const sectionText = buildAtsSectionText(profile, requestedSections);
  const candidateSkillNames = profile.skills.map((s) => s.skill.name);

  const result = computeAtsScore(
    {
      title: job.title,
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      requiredSkillNames: job.skills.map((s) => s.skill.name),
    },
    candidateSkillNames,
    sectionText,
    requestedSections
  );

  return { ok: true, result };
}
