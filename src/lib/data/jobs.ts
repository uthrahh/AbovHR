import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type JobSearchParams = {
  q?: string;
  location?: string;
  employmentType?: string[];
  workMode?: string[];
  fresherFriendly?: boolean;
  minExperience?: number;
  datePosted?: "24h" | "7d" | "30d";
  sort?: "relevance" | "date" | "salary";
  page?: number;
};

const PAGE_SIZE = 12;

export async function searchJobs(params: JobSearchParams) {
  const where: Prisma.JobWhereInput = {
    status: "PUBLISHED",
    deletedAt: null,
  };

  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
      { company: { name: { contains: params.q, mode: "insensitive" } } },
      { skills: { some: { skill: { name: { contains: params.q, mode: "insensitive" } } } } },
    ];
  }

  if (params.location) {
    where.locationCity = { contains: params.location, mode: "insensitive" };
  }

  if (params.employmentType?.length) {
    where.employmentType = { in: params.employmentType as never[] };
  }

  if (params.workMode?.length) {
    where.workMode = { in: params.workMode as never[] };
  }

  if (params.fresherFriendly) {
    where.isFresherFriendly = true;
  }

  if (params.minExperience !== undefined) {
    where.OR = [...(where.OR ?? []), { experienceMinYears: { lte: params.minExperience } }];
  }

  if (params.datePosted) {
    const hoursMap = { "24h": 24, "7d": 24 * 7, "30d": 24 * 30 };
    const since = new Date(Date.now() - hoursMap[params.datePosted] * 60 * 60 * 1000);
    where.publishedAt = { gte: since };
  }

  const orderBy: Prisma.JobOrderByWithRelationInput =
    params.sort === "salary"
      ? { salaryMax: "desc" }
      : params.sort === "date"
        ? { publishedAt: "desc" }
        : { publishedAt: "desc" }; // relevance falls back to recency without a search index

  const page = Math.max(1, params.page ?? 1);

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        company: true,
        skills: { include: { skill: true } },
      },
    }),
    prisma.job.count({ where }),
  ]);

  return { jobs, total, page, pageSize: PAGE_SIZE, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getJobBySlug(slug: string) {
  return prisma.job.findUnique({
    where: { slug },
    include: {
      company: true,
      skills: { include: { skill: true } },
    },
  });
}

export async function getSimilarJobs(jobId: string, companyId: string, skillIds: string[], limit = 4) {
  return prisma.job.findMany({
    where: {
      id: { not: jobId },
      status: "PUBLISHED",
      OR: [{ companyId }, { skills: { some: { skillId: { in: skillIds } } } }],
    },
    include: { company: true, skills: { include: { skill: true } } },
    take: limit,
    orderBy: { publishedAt: "desc" },
  });
}
