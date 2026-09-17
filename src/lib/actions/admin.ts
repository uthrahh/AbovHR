"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/rbac";
import type { Prisma } from "@/generated/prisma/client";

async function logAudit(actorUserId: string, action: string, targetType: string, targetId: string, metadata?: Record<string, unknown>) {
  await prisma.auditLog.create({
    data: { actorUserId, action, targetType, targetId, metadata: metadata as Prisma.InputJsonValue | undefined },
  });
}

export async function setUserStatusAction(userId: string, status: "ACTIVE" | "SUSPENDED") {
  const admin = await requireRole(["ADMIN"]);
  await prisma.user.update({ where: { id: userId }, data: { status } });
  await logAudit(admin.id, `user.status.${status.toLowerCase()}`, "User", userId);
  revalidatePath("/admin/users");
}

export async function setJobModerationStatusAction(jobId: string, status: "PUBLISHED" | "ARCHIVED") {
  const admin = await requireRole(["ADMIN"]);
  await prisma.job.update({ where: { id: jobId }, data: { status } });
  await logAudit(admin.id, `job.moderation.${status.toLowerCase()}`, "Job", jobId);
  revalidatePath("/admin/jobs");
}

export async function resolveReportAction(reportId: string, status: "RESOLVED" | "DISMISSED") {
  const admin = await requireRole(["ADMIN"]);
  await prisma.report.update({ where: { id: reportId }, data: { status, reviewedByUserId: admin.id, reviewedAt: new Date() } });
  await logAudit(admin.id, `report.${status.toLowerCase()}`, "Report", reportId);
  revalidatePath("/admin/reports");
}
