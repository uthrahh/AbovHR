import { prisma } from "@/lib/prisma";
import type { CandidateForMatching } from "@/lib/matching/job-match";

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
