import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

const STATIC_ROUTES = [
  "",
  "/jobs",
  "/career",
  "/learn",
  "/employers",
  "/employers/services",
  "/institutions",
  "/resources",
  "/about",
  "/contact",
  "/accessibility",
  "/legal/privacy-policy",
  "/legal/terms",
  "/legal/cookie-policy",
  "/legal/refund-policy",
  "/data-request",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobs, companies, careerPaths] = await Promise.all([
    prisma.job.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      take: 5000,
    }),
    prisma.company.findMany({
      where: { deletedAt: null },
      select: { slug: true, updatedAt: true },
      take: 5000,
    }),
    prisma.careerPath.findMany({ select: { slug: true } }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  const jobEntries: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${siteUrl}/jobs/${job.slug}`,
    lastModified: job.updatedAt,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const companyEntries: MetadataRoute.Sitemap = companies.map((company) => ({
    url: `${siteUrl}/companies/${company.slug}`,
    lastModified: company.updatedAt,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const careerEntries: MetadataRoute.Sitemap = careerPaths.map((path) => ({
    url: `${siteUrl}/career/${path.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...jobEntries, ...companyEntries, ...careerEntries];
}
