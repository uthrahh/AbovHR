import { prisma } from "@/lib/prisma";

export async function getEmployerDashboardData(companyId: string) {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [openJobsCount, totalApplicants, newApplicantsThisWeek, interviewsScheduled, recentJobs, recentApplicants] = await Promise.all([
    prisma.job.count({ where: { companyId, status: "PUBLISHED" } }),
    prisma.application.count({ where: { job: { companyId } } }),
    prisma.application.count({ where: { job: { companyId }, appliedAt: { gte: weekAgo } } }),
    prisma.interview.count({ where: { application: { job: { companyId } }, status: "SCHEDULED" } }),
    prisma.job.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { _count: { select: { applications: true } } },
    }),
    prisma.application.findMany({
      where: { job: { companyId } },
      orderBy: { appliedAt: "desc" },
      take: 6,
      include: { candidateProfile: { include: { user: true } }, job: true },
    }),
  ]);

  return { openJobsCount, totalApplicants, newApplicantsThisWeek, interviewsScheduled, recentJobs, recentApplicants };
}
