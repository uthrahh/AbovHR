import { prisma } from "@/lib/prisma";
import { computeProfileCompleteness } from "@/lib/profile/completeness";
import { computeJobMatch } from "@/lib/matching/job-match";

export async function getCandidateDashboardData(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      educations: true,
      experiences: true,
      skills: { include: { skill: true } },
      resumes: true,
      applications: {
        include: { job: { include: { company: true } } },
        orderBy: { appliedAt: "desc" },
        take: 5,
      },
      savedJobs: { include: { job: { include: { company: true } } }, orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!profile) return null;

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

  if (completeness.percentage !== profile.profileCompleteness) {
    await prisma.candidateProfile.update({ where: { id: profile.id }, data: { profileCompleteness: completeness.percentage } });
  }

  const [applicationCount, interviewCount, learningPaths] = await Promise.all([
    prisma.application.count({ where: { candidateProfileId: profile.id, status: { not: "WITHDRAWN" } } }),
    prisma.interview.count({
      where: { application: { candidateProfileId: profile.id }, status: "SCHEDULED" },
    }),
    prisma.userLearningPath.findMany({
      where: { userId },
      include: { learningPath: true, moduleProgress: true },
    }),
  ]);

  const candidateSkillNames = new Set(profile.skills.map((s) => s.skill.name.toLowerCase()));

  const recommendedJobsRaw = await prisma.job.findMany({
    where: { status: "PUBLISHED" },
    include: { company: true, skills: { include: { skill: true } } },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });

  const forMatching = {
    skillNames: profile.skills.map((s) => s.skill.name),
    experienceYears: profile.experienceYears ? Number(profile.experienceYears) : null,
    locationCity: profile.locationCity,
    preferredWorkModes: profile.preferredWorkModes,
    hasEducationRecord: profile.educations.length > 0,
  };

  const recommendedJobs = recommendedJobsRaw
    .map((job) => {
      const skillNames = job.skills.map((s) => s.skill.name);
      const match = computeJobMatch(forMatching, {
        requiredSkillNames: skillNames,
        experienceMinYears: job.experienceMinYears,
        experienceMaxYears: job.experienceMaxYears,
        locationCity: job.locationCity,
        workMode: job.workMode,
        educationRequirement: job.educationRequirement,
      });
      return { job, skillNames, matchPercentage: match.percentage };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 6);

  // Skill gaps: pull required skills across the top-matching career path (by candidate skill overlap)
  const careerPaths = await prisma.careerPath.findMany({ include: { requiredSkills: { include: { skill: true } } } });
  let closestPath: (typeof careerPaths)[number] | null = null;
  let bestOverlap = -1;
  for (const path of careerPaths) {
    const overlap = path.requiredSkills.filter((s) => candidateSkillNames.has(s.skill.name.toLowerCase())).length;
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      closestPath = path;
    }
  }
  const skillGaps = closestPath
    ? closestPath.requiredSkills.filter((s) => !candidateSkillNames.has(s.skill.name.toLowerCase())).map((s) => s.skill.name)
    : [];

  const totalModules = learningPaths.reduce((sum, p) => sum + p.moduleProgress.length, 0);
  const completedModules = learningPaths.reduce((sum, p) => sum + p.moduleProgress.filter((m) => m.status === "COMPLETED").length, 0);
  const learningProgressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return {
    profile,
    completeness,
    applicationCount,
    interviewCount,
    savedJobCount: profile.savedJobs.length,
    recommendedJobs,
    recentApplications: profile.applications,
    savedJobs: profile.savedJobs,
    skillGaps: skillGaps.slice(0, 5),
    closestCareerPath: closestPath,
    learningProgressPercentage,
    activeLearningPaths: learningPaths,
  };
}
